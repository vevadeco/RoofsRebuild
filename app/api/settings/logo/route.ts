import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { setSetting } from '@/lib/db';

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ detail: 'Not authenticated' }, { status: 401 });
  if (user.role !== 'admin') return NextResponse.json({ detail: 'Admin access required' }, { status: 403 });

  const formData = await req.formData();
  const file = formData.get('logo') as File | null;
  if (!file) return NextResponse.json({ detail: 'No file provided' }, { status: 400 });

  const allowed = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ detail: 'Only PNG, JPG, SVG, or WebP allowed' }, { status: 400 });
  }
  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ detail: 'File must be under 2MB' }, { status: 400 });
  }

  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  const dataUrl = `data:${file.type};base64,${base64}`;

  await setSetting('logo_url', dataUrl);
  return NextResponse.json({ logo_url: dataUrl });
}
