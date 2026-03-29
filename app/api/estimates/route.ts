import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { pool, initDb } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ detail: 'Not authenticated' }, { status: 401 });
  if (user.role !== 'admin') return NextResponse.json({ detail: 'Admin access required' }, { status: 403 });

  await initDb();
  const { rows } = await pool.query(`
    SELECT e.*, l.name as lead_name, l.email as lead_email, l.phone as lead_phone, l.service_type
    FROM estimates e
    JOIN leads l ON l.id = e.lead_id
    ORDER BY e.created_at DESC
  `);
  return NextResponse.json(rows.map(serialize));
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ detail: 'Not authenticated' }, { status: 401 });
  if (user.role !== 'admin') return NextResponse.json({ detail: 'Admin access required' }, { status: 403 });

  await initDb();
  const { lead_id, items, notes } = await req.json();
  if (!lead_id || !Array.isArray(items)) {
    return NextResponse.json({ detail: 'lead_id and items are required' }, { status: 400 });
  }

  // Verify lead exists
  const { rows: leads } = await pool.query('SELECT id FROM leads WHERE id = $1', [lead_id]);
  if (!leads.length) return NextResponse.json({ detail: 'Lead not found' }, { status: 404 });

  // Auto-increment estimate number
  const { rows: count } = await pool.query('SELECT COUNT(*) FROM estimates');
  const number = `EST-${String(Number(count[0].count) + 1).padStart(4, '0')}`;

  const subtotal = items.reduce((sum: number, item: { qty: number; unit_price: number }) =>
    sum + item.qty * item.unit_price, 0);

  const id = randomUUID();
  const { rows } = await pool.query(
    `INSERT INTO estimates (id, lead_id, number, status, items, notes, subtotal)
     VALUES ($1, $2, $3, 'draft', $4, $5, $6) RETURNING *`,
    [id, lead_id, number, JSON.stringify(items), notes ?? '', subtotal]
  );

  return NextResponse.json(serialize(rows[0]));
}

function serialize(r: Record<string, unknown>) {
  return {
    ...r,
    created_at: r.created_at instanceof Date ? r.created_at.toISOString() : r.created_at,
    sent_at: r.sent_at instanceof Date ? r.sent_at.toISOString() : r.sent_at ?? null,
    accepted_at: r.accepted_at instanceof Date ? r.accepted_at.toISOString() : r.accepted_at ?? null,
  };
}
