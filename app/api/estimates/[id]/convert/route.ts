import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { pool } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ detail: 'Not authenticated' }, { status: 401 });
  if (user.role !== 'admin') return NextResponse.json({ detail: 'Admin access required' }, { status: 403 });

  const { rows } = await pool.query('SELECT * FROM estimates WHERE id = $1', [params.id]);
  if (!rows.length) return NextResponse.json({ detail: 'Estimate not found' }, { status: 404 });

  const est = rows[0];
  if (!['accepted', 'sent'].includes(est.status)) {
    return NextResponse.json({ detail: 'Only accepted or sent estimates can be converted to invoices' }, { status: 400 });
  }

  // Check if invoice already exists
  const { rows: existing } = await pool.query('SELECT id FROM invoices WHERE estimate_id = $1', [params.id]);
  if (existing.length) return NextResponse.json({ detail: 'Invoice already exists for this estimate', invoice_id: existing[0].id }, { status: 409 });

  const { rows: count } = await pool.query('SELECT COUNT(*) FROM invoices');
  const number = `INV-${String(Number(count[0].count) + 1).padStart(4, '0')}`;

  const id = randomUUID();
  const subtotal = Number(est.subtotal);

  // Create invoice — payment method and tax calculated at payment time
  const { rows: inv } = await pool.query(
    `INSERT INTO invoices (id, estimate_id, lead_id, number, status, subtotal, tax, transaction_fee, total)
     VALUES ($1, $2, $3, $4, 'pending', $5, 0, 0, $5) RETURNING *`,
    [id, est.id, est.lead_id, number, subtotal]
  );

  // Mark estimate as converted
  await pool.query("UPDATE estimates SET status = 'converted' WHERE id = $1", [params.id]);

  return NextResponse.json(serializeInvoice(inv[0]));
}

function serializeInvoice(r: Record<string, unknown>) {
  return {
    ...r,
    created_at: r.created_at instanceof Date ? r.created_at.toISOString() : r.created_at,
    paid_at: r.paid_at instanceof Date ? r.paid_at.toISOString() : r.paid_at ?? null,
  };
}
