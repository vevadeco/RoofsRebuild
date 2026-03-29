import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

// Public route — no auth required (client needs to view their invoice)
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { rows } = await pool.query(`
    SELECT i.*, l.name as lead_name, l.email as lead_email, l.phone as lead_phone,
           e.number as estimate_number, e.items, e.notes
    FROM invoices i
    JOIN leads l ON l.id = i.lead_id
    JOIN estimates e ON e.id = i.estimate_id
    WHERE i.id = $1
  `, [params.id]);
  if (!rows.length) return NextResponse.json({ detail: 'Invoice not found' }, { status: 404 });
  return NextResponse.json(serialize(rows[0]));
}

function serialize(r: Record<string, unknown>) {
  return {
    ...r,
    created_at: r.created_at instanceof Date ? r.created_at.toISOString() : r.created_at,
    paid_at: r.paid_at instanceof Date ? r.paid_at.toISOString() : r.paid_at ?? null,
  };
}
