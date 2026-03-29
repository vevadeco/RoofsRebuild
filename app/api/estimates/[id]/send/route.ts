import { NextRequest, NextResponse } from 'next/server';
import { pool, getSetting } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { Resend } from 'resend';

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ detail: 'Not authenticated' }, { status: 401 });
  if (user.role !== 'admin') return NextResponse.json({ detail: 'Admin access required' }, { status: 403 });

  const { rows } = await pool.query(`
    SELECT e.*, l.name as lead_name, l.email as lead_email, l.phone as lead_phone
    FROM estimates e JOIN leads l ON l.id = e.lead_id
    WHERE e.id = $1
  `, [params.id]);
  if (!rows.length) return NextResponse.json({ detail: 'Not found' }, { status: 404 });

  const est = rows[0];
  const items: { description: string; qty: number; unit_price: number }[] = est.items;

  const [apiKey, senderEmail] = await Promise.all([
    getSetting('resend_api_key'),
    getSetting('sender_email'),
  ]);
  const resolvedKey = apiKey ?? process.env.RESEND_API_KEY;
  const resolvedSender = senderEmail ?? process.env.SENDER_EMAIL ?? 'onboarding@resend.dev';

  if (!resolvedKey) return NextResponse.json({ detail: 'Resend API key not configured' }, { status: 400 });

  const itemRows = items.map(i =>
    `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #F1F5F9">${i.description}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #F1F5F9;text-align:center">${i.qty}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #F1F5F9;text-align:right">$${Number(i.unit_price).toFixed(2)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #F1F5F9;text-align:right">$${(i.qty * i.unit_price).toFixed(2)}</td>
    </tr>`
  ).join('');

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#1E293B">
      <div style="background:#DC2626;padding:24px 32px;border-radius:8px 8px 0 0">
        <h1 style="color:white;margin:0;font-size:22px">Roofs Canada</h1>
        <p style="color:#FCA5A5;margin:4px 0 0">Estimate ${est.number}</p>
      </div>
      <div style="background:white;padding:32px;border:1px solid #E2E8F0;border-top:none;border-radius:0 0 8px 8px">
        <p>Hi ${est.lead_name},</p>
        <p>Thank you for reaching out. Please find your estimate below.</p>
        <table style="width:100%;border-collapse:collapse;margin:24px 0">
          <thead>
            <tr style="background:#F8FAFC">
              <th style="padding:10px 12px;text-align:left;font-size:12px;text-transform:uppercase;color:#64748B">Description</th>
              <th style="padding:10px 12px;text-align:center;font-size:12px;text-transform:uppercase;color:#64748B">Qty</th>
              <th style="padding:10px 12px;text-align:right;font-size:12px;text-transform:uppercase;color:#64748B">Unit Price</th>
              <th style="padding:10px 12px;text-align:right;font-size:12px;text-transform:uppercase;color:#64748B">Total</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding:12px;text-align:right;font-weight:bold">Subtotal</td>
              <td style="padding:12px;text-align:right;font-weight:bold;font-size:18px">$${Number(est.subtotal).toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
        ${est.notes ? `<p style="background:#F8FAFC;padding:16px;border-radius:6px;font-size:14px">${est.notes}</p>` : ''}
        <p style="color:#64748B;font-size:13px;margin-top:32px">To accept this estimate or ask any questions, simply reply to this email or call us directly.</p>
        <p style="color:#64748B;font-size:12px;margin-top:24px">Roofs Canada — Southern Ontario's Trusted Roofing Experts</p>
      </div>
    </div>`;

  const resend = new Resend(resolvedKey);
  await resend.emails.send({
    from: resolvedSender,
    to: [est.lead_email],
    subject: `Your Estimate from Roofs Canada — ${est.number}`,
    html,
  });

  await pool.query("UPDATE estimates SET status = 'sent', sent_at = NOW() WHERE id = $1", [params.id]);

  return NextResponse.json({ message: 'Estimate sent' });
}
