import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ detail: 'Not authenticated' }, { status: 401 });
  if (user.role !== 'admin') return NextResponse.json({ detail: 'Admin access required' }, { status: 403 });

  const { rows } = await pool.query(`
    SELECT e.*, l.name as lead_name, l.email as lead_email, l.phone as lead_phone, l.service_type
    FROM estimates e JOIN leads l ON l.id = e.lead_id
    WHERE e.id = $1
  `, [params.id]);
  if (!rows.length) return NextResponse.json({ detail: 'Not found' }, { status: 404 });
  return NextResponse.json(serialize(rows[0]));
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ detail: 'Not authenticated' }, { status: 401 });
  if (user.role !== 'admin') return NextResponse.json({ detail: 'Admin access required' }, { status: 403 });

  const body = await req.json();
  const { items, notes, status } = body;

  const { rows: existing } = await pool.query('SELECT * FROM estimates WHERE id = $1', [params.id]);
  if (!existing.length) return NextResponse.json({ detail: 'Not found' }, { status: 404 });

  // Calculate subtotal from lineItems (new structured format) or items array (legacy)
  let subtotal = existing[0].subtotal;
  if (items) {
    const lineItems = items.lineItems ?? (Array.isArray(items) ? items : []);
    subtotal = lineItems.reduce((s: number, i: { qty: number; unit_price: number }) => s + i.qty * i.unit_price, 0);
  }

  const { rows } = await pool.query(
    `UPDATE estimates SET
      items = COALESCE($1, items),
      notes = COALESCE($2, notes),
      status = COALESCE($3, status),
      subtotal = $4,
      accepted_at = CASE WHEN $3 = 'accepted' THEN NOW() ELSE accepted_at END
     WHERE id = $5 RETURNING *`,
    [items ? JSON.stringify(items) : null, notes ?? null, status ?? null, subtotal, params.id]
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
