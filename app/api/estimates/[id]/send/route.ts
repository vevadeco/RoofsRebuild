import { NextRequest, NextResponse } from 'next/server';
import { pool, getSetting } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { Resend } from 'resend';
import { renderToBuffer } from '@react-pdf/renderer';
import { ProposalPdfDocument, PdfDocument } from '@/lib/pdf';
import React from 'react';

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ detail: 'Not authenticated' }, { status: 401 });
  if (user.role !== 'admin') return NextResponse.json({ detail: 'Admin access required' }, { status: 403 });

  const { rows } = await pool.query(`
    SELECT e.*, l.name as lead_name, l.email as lead_email, l.phone as lead_phone
    FROM estimates e JOIN leads l ON l.id = e.lead_id
    WHERE e.id = $1
  `, [params.id]);
  if (!rows.length) return NextResponse.json({ detail: 'Not found' }, { status: 404 });

  const est = rows[0];

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

  // Determine if this is the new proposal format or legacy
  const items = est.items;
  const isProposalFormat = items && items.job && items.lineItems;

  let pdfBuffer: Buffer;
  let lineItems: { description: string; qty: number; unit_price: number }[];

  if (isProposalFormat) {
    lineItems = items.lineItems;
    pdfBuffer = await renderToBuffer(
      React.createElement(ProposalPdfDocument, {
        number: est.number,
        date: new Date().toLocaleDateString('en-CA', { dateStyle: 'long' }),
        logoUrl: logo_url ?? undefined,
        companyName,
        companyAddress: company_address ?? undefined,
        companyPhone: company_phone ?? undefined,
        companyEmail: company_email ?? undefined,
        clientName: est.lead_name,
        clientEmail: est.lead_email,
        clientPhone: est.lead_phone,
        job: items.job,
        roofConditions: items.roofConditions,
        shingles: items.shingles,
        underlayment: items.underlayment,
        flashing: items.flashing || [],
        installationOptions: items.installationOptions || [],
        lineItems,
        exclusions: items.exclusions || '',
        payment: items.payment || { deposit: 0, validDays: 30 },
        subtotal: Number(est.subtotal),
        notes: est.notes || undefined,
        terms: terms_and_conditions ?? undefined,
      }) as any
    );
  } else {
    // Legacy format — items is an array of line items
    lineItems = Array.isArray(items) ? items : [];
    pdfBuffer = await renderToBuffer(
      React.createElement(PdfDocument, {
        type: 'ESTIMATE',
        number: est.number,
        date: new Date().toLocaleDateString('en-CA', { dateStyle: 'long' }),
        logoUrl: logo_url ?? undefined,
        companyName,
        companyAddress: company_address ?? undefined,
        companyPhone: company_phone ?? undefined,
        companyEmail: company_email ?? undefined,
        clientName: est.lead_name,
        clientEmail: est.lead_email,
        clientPhone: est.lead_phone,
        items: lineItems,
        notes: est.notes,
        subtotal: Number(est.subtotal),
        total: Number(est.subtotal),
        terms: terms_and_conditions ?? undefined,
      }) as any
    );
  }

  const itemRows = lineItems.map(i =>
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
        <p style="color:#FCA5A5;margin:4px 0 0">Roofing Proposal ${est.number}</p>
      </div>
      <div style="background:white;padding:32px;border:1px solid #E2E8F0;border-top:none;border-radius:0 0 8px 8px">
        <p>Hi ${est.lead_name},</p>
        <p>Thank you for reaching out. Please find your roofing proposal attached as a PDF.</p>
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
              <td colspan="3" style="padding:12px;text-align:right;font-weight:bold">Subtotal</td>
              <td style="padding:12px;text-align:right;font-weight:bold;font-size:18px">${Number(est.subtotal).toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
        ${est.notes ? `<p style="background:#F8FAFC;padding:16px;border-radius:6px;font-size:14px">${est.notes}</p>` : ''}
        <p style="color:#64748B;font-size:13px;margin-top:32px">To accept this proposal or ask any questions, simply reply to this email or call us directly.</p>
        <p style="color:#64748B;font-size:12px;margin-top:24px">${companyName} — Southern Ontario's Trusted Roofing Experts</p>
      </div>
    </div>`;

  const resend = new Resend(resolvedKey);
  await resend.emails.send({
    from: resolvedSender,
    to: [est.lead_email],
    subject: `Your Roofing Proposal from ${companyName} — ${est.number}`,
    html,
    attachments: [
      {
        filename: `proposal-${est.number}.pdf`,
        content: pdfBuffer,
      },
    ],
  });

  await pool.query("UPDATE estimates SET status = 'sent', sent_at = NOW() WHERE id = $1", [params.id]);

  return NextResponse.json({ message: 'Proposal sent' });
}
