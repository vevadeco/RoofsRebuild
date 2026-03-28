import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ detail: 'Not authenticated' }, { status: 401 });
  if (user.role !== 'admin') return NextResponse.json({ detail: 'Admin access required' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  if (!status) return NextResponse.json({ detail: 'status query param required' }, { status: 400 });

  const result = await pool.query('UPDATE leads SET status = $1 WHERE id = $2', [status, params.id]);
  if (result.rowCount === 0) return NextResponse.json({ detail: 'Lead not found' }, { status: 404 });

  return NextResponse.json({ message: 'Lead status updated successfully' });
}
