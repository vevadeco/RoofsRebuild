import { NextRequest, NextResponse } from 'next/server';
import { pool, getSetting } from '@/lib/db';
import Stripe from 'stripe';

const TAX_RATE = 0.13;       // 13% HST
const CARD_FEE_RATE = 0.03;  // 3% transaction fee

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { payment_method } = await req.json(); // 'cash' | 'card'

  const { rows } = await pool.query(`
    SELECT i.*, l.name as lead_name, l.email as lead_email, e.items, e.notes, e.number as estimate_number
    FROM invoices i
    JOIN leads l ON l.id = i.lead_id
    JOIN estimates e ON e.id = i.estimate_id
    WHERE i.id = $1
  `, [params.id]);
  if (!rows.length) return NextResponse.json({ detail: 'Invoice not found' }, { status: 404 });

  const inv = rows[0];
  if (inv.status === 'paid') return NextResponse.json({ detail: 'Invoice already paid' }, { status: 400 });

  const subtotal = Number(inv.subtotal);

  if (payment_method === 'cash') {
    // Cash — no tax, no fee
    await pool.query(
      `UPDATE invoices SET payment_method = 'cash', tax = 0, transaction_fee = 0, total = $1,
       status = 'paid', paid_at = NOW() WHERE id = $2`,
      [subtotal, params.id]
    );
    return NextResponse.json({ payment_method: 'cash', total: subtotal, status: 'paid' });
  }

  if (payment_method === 'card') {
    const stripeKey = (await getSetting('stripe_secret_key')) ?? process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) return NextResponse.json({ detail: 'Stripe not configured' }, { status: 400 });

    const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
    const fee = Math.round(subtotal * CARD_FEE_RATE * 100) / 100;
    const total = Math.round((subtotal + tax + fee) * 100) / 100;

    const stripe = new Stripe(stripeKey, { apiVersion: '2024-04-10' });
    const origin = req.headers.get('origin') ?? 'https://roofscanada.ca';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: inv.lead_email,
      line_items: [
        {
          price_data: {
            currency: 'cad',
            product_data: { name: `Invoice ${inv.number} — Roofs Canada` },
            unit_amount: Math.round(subtotal * 100),
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: 'cad',
            product_data: { name: 'HST (13%)' },
            unit_amount: Math.round(tax * 100),
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: 'cad',
            product_data: { name: 'Card Processing Fee (3%)' },
            unit_amount: Math.round(fee * 100),
          },
          quantity: 1,
        },
      ],
      metadata: { invoice_id: params.id },
      success_url: `${origin}/invoice/${params.id}?paid=1`,
      cancel_url: `${origin}/invoice/${params.id}`,
    });

    // Store session and updated totals
    await pool.query(
      `UPDATE invoices SET payment_method = 'card', tax = $1, transaction_fee = $2, total = $3,
       stripe_session_id = $4 WHERE id = $5`,
      [tax, fee, total, session.id, params.id]
    );

    return NextResponse.json({ url: session.url, total });
  }

  return NextResponse.json({ detail: 'Invalid payment_method' }, { status: 400 });
}
