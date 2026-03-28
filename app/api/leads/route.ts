import { NextRequest, NextResponse } from 'next/server';
import { randomUUID, createHash } from 'crypto';
import { pool, getSetting, initDb } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { Resend } from 'resend';

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ detail: 'Not authenticated' }, { status: 401 });
  if (user.role !== 'admin') return NextResponse.json({ detail: 'Admin access required' }, { status: 403 });

  await initDb();
  const { rows } = await pool.query('SELECT * FROM leads ORDER BY created_at DESC');
  return NextResponse.json(rows.map((r) => ({ ...r, created_at: r.created_at.toISOString() })));
}

export async function POST(req: NextRequest) {
  try {
    await initDb();
    const { name, email, phone, service_type, message } = await req.json();
    if (!name || !email || !phone || !service_type || !message) {
      return NextResponse.json({ detail: 'All fields are required' }, { status: 400 });
    }

    const id = randomUUID();
    const now = new Date();

    await pool.query(
      `INSERT INTO leads (id, name, email, phone, service_type, message, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'new', $7)`,
      [id, name, email, phone, service_type, message, now]
    );

    // Fetch all integration settings in parallel
    const [apiKey, senderEmail, notificationEmail, fbAccessToken, fbPixelId, fbDatasetId] =
      await Promise.all([
        getSetting('resend_api_key'),
        getSetting('sender_email'),
        getSetting('notification_email'),
        getSetting('fb_access_token'),
        getSetting('fb_pixel_id'),
        getSetting('fb_dataset_id'),
      ]);

    // ── Resend email notification ──────────────────────────────────────────
    const resolvedApiKey = apiKey ?? process.env.RESEND_API_KEY;
    const resolvedSender = senderEmail ?? process.env.SENDER_EMAIL ?? 'onboarding@resend.dev';
    const resolvedTo = notificationEmail ?? process.env.ADMIN_NOTIFICATION_EMAIL ?? 'admin@roofscanada.com';

    if (resolvedApiKey) {
      const resend = new Resend(resolvedApiKey);
      resend.emails
        .send({
          from: resolvedSender,
          to: [resolvedTo],
          subject: `New Lead: ${service_type} - ${name}`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
              <h2 style="color:#DC2626">New Lead from Roofs Canada</h2>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Phone:</strong> ${phone}</p>
              <p><strong>Service:</strong> ${service_type}</p>
              <p><strong>Message:</strong> ${message}</p>
              <hr style="border:1px solid #E5E7EB;margin:20px 0">
              <p style="color:#6B7280;font-size:12px">Received at ${now.toUTCString()}</p>
            </div>`,
        })
        .catch((err) => console.error('Email send failed:', err));
    }

    // ── Facebook Conversions API (server-side Lead event) ─────────────────
    const resolvedFbToken = fbAccessToken ?? process.env.FB_ACCESS_TOKEN;
    const resolvedPixelId = fbPixelId ?? fbDatasetId ?? process.env.FB_PIXEL_ID;

    if (resolvedFbToken && resolvedPixelId) {
      const hash = (v: string) => createHash('sha256').update(v.trim().toLowerCase()).digest('hex');
      const payload = {
        data: [{
          event_name: 'Lead',
          event_time: Math.floor(now.getTime() / 1000),
          event_id: id,
          action_source: 'website',
          user_data: {
            em: [hash(email)],
            ph: [hash(phone.replace(/\D/g, ''))],
          },
          custom_data: { service_type },
        }],
      };
      fetch(`https://graph.facebook.com/v19.0/${resolvedPixelId}/events?access_token=${resolvedFbToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch((err) => console.error('FB CAPI failed:', err));
    }

    return NextResponse.json({ id, name, email, phone, service_type, message, status: 'new', created_at: now.toISOString() });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[leads POST]', message);
    return NextResponse.json({ detail: message }, { status: 500 });
  }
}
