import { NextResponse } from 'next/server';
import { getSetting, initDb } from '@/lib/db';

// Public — no auth required
export async function GET() {
  await initDb();
  const [logo_url, logo_text, company_name] = await Promise.all([
    getSetting('logo_url'),
    getSetting('logo_text'),
    getSetting('company_name'),
  ]);
  return NextResponse.json({
    logo_url: logo_url ?? '',
    logo_text: logo_text ?? '',
    company_name: company_name ?? 'Roofs Canada',
  });
}
