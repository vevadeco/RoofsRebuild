import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getSetting } from '@/lib/db';
import { Resend } from 'resend';

export async function POST() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ detail: 'Not authenticated' }, { status: 401 });
  if (user.role !== 'admin') return NextResponse.json({ detail: 'Admin access required' }, { status: 403 });

  const [apiKey, senderEmail, notificationEmail] = await Promise.all([
    getSetting('resend_api_key'),
    getSetting('sender_email'),
    getSetting('notification_email'),
  ]);

  const resolvedApiKey = apiKey ?? process.env.RESEND_API_KEY;
  const resolvedSender = senderEmail ?? process.env.SENDER_EMAIL ?? 'onboarding@resend.dev';
  const resolvedTo = notificationEmail ?? process.env.ADMIN_NOTIFICATION_EMAIL;

  if (!resolvedApiKey) {
    return NextResponse.json({ detail: 'Resend API key not configured' }, { status: 400 });
  }
  if (!resolvedTo) {
    return NextResponse.json({ detail: 'Notification email not configured' }, { status: 400 });
  }

  try {
    const resend = new Resend(resolvedApiKey);
    await resend.emails.send({
      from: resolvedSender,
      to: [resolvedTo],
      subject: 'Roofs Canada — Test Email',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#DC2626">Test Email</h2>
          <p>Your Resend integration is working correctly.</p>
          <p style="color:#6B7280;font-size:12px">Sent from Roofs Canada admin settings.</p>
        </div>`,
    });
    return NextResponse.json({ message: 'Test email sent' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ detail: `Resend error: ${message}` }, { status: 500 });
  }
}
