import { NextResponse } from 'next/server';
import { pool, initDb } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ detail: 'Not authenticated' }, { status: 401 });
  if (user.role !== 'admin') return NextResponse.json({ detail: 'Admin access required' }, { status: 403 });

  await initDb();
  const { rows } = await pool.query(`
    SELECT i.*, l.name as lead_name, l.email as lead_email, l.phone as lead_phone,
           e.number as estimate_number, e.items, e.notes
    FROM invoices i
    JOIN leads l ON l.id = i.lead_id
    JOIN estimates e ON e.id = i.estimate_id
    ORDER BY i.created_at DESC
  `);
  return NextResponse.json(rows.map(serialize));
}

function serialize(r: Record<string, unknown>) {
  return {
    ...r,
    created_at: r.created_at instanceof Date ? r.created_at.toISOString() : r.created_at,
    paid_at: r.paid_at instanceof Date ? r.paid_at.toISOString() : r.paid_at ?? null,
  };
}
