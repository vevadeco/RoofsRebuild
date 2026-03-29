import { NextRequest, NextResponse } from 'next/server';
import { pool, getSetting } from '@/lib/db';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') ?? '';

  const stripeKey = (await getSetting('stripe_secret_key')) ?? process.env.STRIPE_SECRET_KEY;
  const webhookSecret = (await getSetting('stripe_webhook_secret')) ?? process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey || !webhookSecret) {
    return NextResponse.json({ detail: 'Stripe not configured' }, { status: 400 });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error('Stripe webhook signature failed:', err);
    return NextResponse.json({ detail: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const invoiceId = session.metadata?.invoice_id;
    if (invoiceId) {
      await pool.query(
        `UPDATE invoices SET status = 'paid', stripe_payment_intent = $1, paid_at = NOW() WHERE id = $2`,
        [session.payment_intent, invoiceId]
      );
    }
  }

  return NextResponse.json({ received: true });
}
