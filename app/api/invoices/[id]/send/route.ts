import { NextRequest, NextResponse } from 'next/server';
import { pool, getSetting } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { Resend } from 'resend';
import { renderToBuffer } from '@react-pdf/renderer';
import { PdfDocument } from '@/lib/pdf';
import React from 'react';

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ detail: 'Not authenticated' }, { status: 401 });
  if (user.role !== 'admin') return NextResponse.json({ detail: 'Admin access required' }, { status: 403 });

  const { rows } = await pool.query(`
    SELECT i.*, l.name as lead_name, l.email as lead_email, l.phone as lead_phone,
           e.items, e.notes
    FROM invoices i
    JOIN leads l ON l.id = i.lead_id
    JOIN estimates e ON e.id = i.estimate_id
    WHERE i.id = $1
  `, [params.id]);
  if (!rows.length) return NextResponse.json({ detail: 'Invoice not found' }, { status: 404 });

  const inv = rows[0];

  const [
    apiKey, senderEmail,
    logo_url, company_name, company_address, company_phone, company_email, terms_and_conditions,
  ] = await Promise.all([
    getSetting('resend_api_key'),
    getSetting('sender_email'),
    getSetting('logo_url'),
    getSetting('company_name'),
    getSetting('company_address'),
    getSetting('company_phone'),
    getSetting('company_email'),
    getSetting('terms_and_conditions'),
  ]);

  const resolvedKey = apiKey ?? process.env.RESEND_API_KEY;
  const resolvedSender = senderEmail ?? process.env.SENDER_EMAIL ?? 'onboarding@resend.dev';
  const companyName = company_name ?? 'Roofs Canada';

  if (!resolvedKey) return NextResponse.json({ detail: 'Resend API key not configured' }, { status: 400 });

  const subtotal = Number(inv.subtotal);
  const tax = Number(inv.tax);
  const transactionFee = Number(inv.transaction_fee);
  const total = Number(inv.total);

  const pdfBuffer = await renderToBuffer(
    React.createElement(PdfDocument, {
      type: 'INVOICE',
      number: inv.number,
      date: new Date().toLocaleDateString('en-CA', { dateStyle: 'long' }),
      logoUrl: logo_url ?? undefined,
      companyName,
      companyAddress: company_address ?? undefined,
      companyPhone: company_phone ?? undefined,
      companyEmail: company_email ?? undefined,
      clientName: inv.lead_name,
      clientEmail: inv.lead_email,
      clientPhone: inv.lead_phone,
      items: inv.items,
      notes: inv.notes,
      subtotal,
      tax: tax > 0 ? tax : undefined,
      transactionFee: transactionFee > 0 ? transactionFee : undefined,
      total,
      paymentMethod: inv.payment_method ?? undefined,
      terms: terms_and_conditions ?? undefined,
    })
  );

  const items: { description: string; qty: number; unit_price: number }[] = inv.items;
  const itemRows = items.map(i =>
    `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #F1F5F9">${i.description}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #F1F5F9;text-align:center">${i.qty}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #F1F5F9;text-align:right">${Number(i.unit_price).toFixed(2)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #F1F5F9;text-align:right">${(i.qty * i.unit_price).toFixed(2)}</td>
    </tr>`
  ).join('');

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#1E293B">
      <div style="background:#DC2626;padding:24px 32px;border-radius:8px 8px 0 0">
        <h1 style="color:white;margin:0;font-size:22px">${companyName}</h1>
        <p style="color:#FCA5A5;margin:4px 0 0">Invoice ${inv.number}</p>
      </div>
      <div style="background:white;padding:32px;border:1px solid #E2E8F0;border-top:none;border-radius:0 0 8px 8px">
        <p>Hi ${inv.lead_name},</p>
        <p>Please find your invoice attached as a PDF.</p>
        <table style="width:100%;border-collapse:collapse;margin:24px 0">
          <thead>
            <tr style="background:#F8FAFC">
              <th style="padding:10px 12px;text-align:left;font-size:12px;text-transform:uppercase;color:#64748B">Description</th>
              <th style="padding:10px 12px;text-align:center;font-size:12px;text-transform:uppercase;color:#64748B">Qty</th>
              <th style="padding:10px 12px;text-align:right;font-size:12px;text-transform:uppercase;color:#64748B">Unit Price</th>
              <th style="padding:10px 12px;text-align:right;font-size:12px;text-transform:uppercase;color:#64748B">Total</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding:8px 12px;text-align:right">Subtotal</td>
              <td style="padding:8px 12px;text-align:right">$${subtotal.toFixed(2)}</td>
            </tr>
            ${tax > 0 ? `<tr><td colspan="3" style="padding:4px 12px;text-align:right;color:#64748B">HST (13%)</td><td style="padding:4px 12px;text-align:right;color:#64748B">$${tax.toFixed(2)}</td></tr>` : ''}
            ${transactionFee > 0 ? `<tr><td colspan="3" style="padding:4px 12px;text-align:right;color:#64748B">Card Fee (3%)</td><td style="padding:4px 12px;text-align:right;color:#64748B">$${transactionFee.toFixed(2)}</td></tr>` : ''}
            <tr>
              <td colspan="3" style="padding:12px;text-align:right;font-weight:bold">Total</td>
              <td style="padding:12px;text-align:right;font-weight:bold;font-size:18px">$${total.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
        ${inv.notes ? `<p style="background:#F8FAFC;padding:16px;border-radius:6px;font-size:14px">${inv.notes}</p>` : ''}
        <p style="color:#64748B;font-size:13px;margin-top:32px">If you have any questions, please reply to this email.</p>
        <p style="color:#64748B;font-size:12px;margin-top:24px">${companyName} — Southern Ontario's Trusted Roofing Experts</p>
      </div>
    </div>`;

  const resend = new Resend(resolvedKey);
  await resend.emails.send({
    from: resolvedSender,
    to: [inv.lead_email],
    subject: `Your Invoice from ${companyName} — ${inv.number}`,
    html,
    attachments: [
      {
        filename: `invoice-${inv.number}.pdf`,
        content: pdfBuffer,
      },
    ],
  });

  return NextResponse.json({ message: 'Invoice sent' });
}
