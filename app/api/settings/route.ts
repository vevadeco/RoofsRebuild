import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getAllSettings, setSetting, initDb } from '@/lib/db';

async function requireAdmin() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ detail: 'Not authenticated' }, { status: 401 });
  if (user.role !== 'admin') return NextResponse.json({ detail: 'Admin access required' }, { status: 403 });
  return null;
}

export async function GET() {
  const err = await requireAdmin();
  if (err) return err;

  await initDb();
  const settings = await getAllSettings();

  // Mask the API key — only return whether it's set, not the value
  return NextResponse.json({
    resend_api_key: settings.resend_api_key ? '••••••••' : '',
    resend_api_key_set: !!settings.resend_api_key,
    sender_email: settings.sender_email ?? '',
    notification_email: settings.notification_email ?? '',
    seo_title: settings.seo_title ?? '',
    seo_description: settings.seo_description ?? '',
    seo_keywords: settings.seo_keywords ?? '',
    seo_og_image: settings.seo_og_image ?? '',
    gtag_id: settings.gtag_id ?? '',
    fb_pixel_id: settings.fb_pixel_id ?? '',
    fb_access_token: settings.fb_access_token ? '••••••••' : '',
    fb_access_token_set: !!settings.fb_access_token,
    fb_dataset_id: settings.fb_dataset_id ?? '',
    stripe_secret_key_set: !!settings.stripe_secret_key,
    stripe_publishable_key: settings.stripe_publishable_key ?? '',
    stripe_webhook_secret_set: !!settings.stripe_webhook_secret,
    logo_url: settings.logo_url ?? '',
    logo_text: settings.logo_text ?? '',
    company_name: settings.company_name ?? 'Roofs Canada',
    company_address: settings.company_address ?? '',
    company_phone: settings.company_phone ?? '',
    company_email: settings.company_email ?? '',
    terms_and_conditions: settings.terms_and_conditions ?? '',
    gst_hst_number: settings.gst_hst_number ?? '',
    company_website: settings.company_website ?? '',
  });
}

export async function POST(req: NextRequest) {
  const err = await requireAdmin();
  if (err) return err;

  await initDb();
  const body = await req.json();

  const allowed = [
    'resend_api_key', 'sender_email', 'notification_email',
    'seo_title', 'seo_description', 'seo_keywords', 'seo_og_image',
    'gtag_id',
    'fb_pixel_id', 'fb_access_token', 'fb_dataset_id',
    'stripe_secret_key', 'stripe_publishable_key', 'stripe_webhook_secret',
    'logo_text',
    'company_name', 'company_address', 'company_phone', 'company_email',
    'terms_and_conditions', 'gst_hst_number', 'company_website',
  ];
  for (const key of allowed) {
    if (typeof body[key] === 'string' && body[key].trim() !== '') {
      await setSetting(key, body[key].trim());
    }
  }

  return NextResponse.json({ message: 'Settings saved' });
}
