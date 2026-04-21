import React from 'react';
import {
  Document, Page, Text, View, Image, StyleSheet, Font,
} from '@react-pdf/renderer';

Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5Q.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmEU9fBBc9.ttf', fontWeight: 700 },
  ],
});

const c = {
  red: '#DC2626',
  dark: '#1E293B',
  mid: '#475569',
  light: '#94A3B8',
  border: '#E2E8F0',
  bg: '#F8FAFC',
  white: '#FFFFFF',
};

const s = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 9, color: c.dark, padding: 40, backgroundColor: c.white },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  logo: { width: 120, height: 40, objectFit: 'contain' },
  logoText: { fontSize: 18, fontWeight: 700, color: c.red },
  docMeta: { alignItems: 'flex-end' },
  docType: { fontSize: 20, fontWeight: 700, color: c.red, marginBottom: 4 },
  docNumber: { fontSize: 10, color: c.mid },
  docDate: { fontSize: 9, color: c.light, marginTop: 2 },
  divider: { borderBottom: `1px solid ${c.border}`, marginBottom: 20 },
  twoCol: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  colLabel: { fontSize: 7, fontWeight: 700, color: c.light, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  colValue: { fontSize: 9, color: c.dark, lineHeight: 1.5 },
  tableHeader: { flexDirection: 'row', backgroundColor: c.bg, padding: '6 8', borderRadius: 3, marginBottom: 2 },
  tableRow: { flexDirection: 'row', padding: '6 8', borderBottom: `1px solid ${c.border}` },
  colDesc: { flex: 4, fontSize: 9 },
  colQty: { flex: 1, textAlign: 'center', fontSize: 9 },
  colPrice: { flex: 1.5, textAlign: 'right', fontSize: 9 },
  colTotal: { flex: 1.5, textAlign: 'right', fontSize: 9 },
  thText: { fontSize: 7, fontWeight: 700, color: c.light, textTransform: 'uppercase', letterSpacing: 0.5 },
  subtotalRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8, paddingTop: 8, borderTop: `1px solid ${c.border}` },
  subtotalLabel: { fontSize: 9, color: c.mid, marginRight: 16 },
  subtotalValue: { fontSize: 12, fontWeight: 700, color: c.dark, minWidth: 70, textAlign: 'right' },
  taxRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 4 },
  taxLabel: { fontSize: 8, color: c.light, marginRight: 16 },
  taxValue: { fontSize: 9, color: c.mid, minWidth: 70, textAlign: 'right' },
  totalRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 6, paddingTop: 6, borderTop: `2px solid ${c.red}` },
  totalLabel: { fontSize: 10, fontWeight: 700, color: c.dark, marginRight: 16 },
  totalValue: { fontSize: 14, fontWeight: 700, color: c.red, minWidth: 70, textAlign: 'right' },
  notesBox: { backgroundColor: c.bg, padding: 12, borderRadius: 4, marginTop: 20 },
  notesLabel: { fontSize: 7, fontWeight: 700, color: c.light, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  notesText: { fontSize: 9, color: c.mid, lineHeight: 1.5 },
  termsBox: { marginTop: 20, paddingTop: 12, borderTop: `1px solid ${c.border}` },
  termsLabel: { fontSize: 7, fontWeight: 700, color: c.light, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  termsText: { fontSize: 8, color: c.light, lineHeight: 1.6 },
  sigSection: { marginTop: 28, flexDirection: 'row', gap: 24 },
  sigBox: { flex: 1 },
  sigLabel: { fontSize: 8, color: c.mid, marginBottom: 24 },
  sigLine: { borderBottom: `1px solid ${c.dark}`, marginBottom: 4 },
  sigSubLabel: { fontSize: 7, color: c.light },
  footer: { position: 'absolute', bottom: 24, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontSize: 7, color: c.light },
});

export type PdfLineItem = { description: string; qty: number; unit_price: number };

export type PdfDocProps = {
  type: 'ESTIMATE' | 'INVOICE';
  number: string;
  date: string;
  logoUrl?: string;
  companyName: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  items: PdfLineItem[];
  notes?: string;
  subtotal: number;
  tax?: number;
  transactionFee?: number;
  total: number;
  paymentMethod?: string;
  terms?: string;
};

export function PdfDocument({
  type, number, date, logoUrl, companyName, companyAddress, companyPhone, companyEmail,
  clientName, clientEmail, clientPhone, items, notes, subtotal, tax, transactionFee, total,
  paymentMethod, terms,
}: PdfDocProps) {
  return (
    <Document>
      <Page size="LETTER" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View>
            {logoUrl
              ? <Image src={logoUrl} style={s.logo} />
              : <Text style={s.logoText}>{companyName}</Text>
            }
            {companyAddress && <Text style={{ ...s.colValue, marginTop: 6, color: c.mid }}>{companyAddress}</Text>}
            {companyPhone && <Text style={{ ...s.colValue, color: c.mid }}>{companyPhone}</Text>}
            {companyEmail && <Text style={{ ...s.colValue, color: c.mid }}>{companyEmail}</Text>}
          </View>
          <View style={s.docMeta}>
            <Text style={s.docType}>{type}</Text>
            <Text style={s.docNumber}>{number}</Text>
            <Text style={s.docDate}>{date}</Text>
          </View>
        </View>

        <View style={s.divider} />

        {/* Bill To */}
        <View style={s.twoCol}>
          <View>
            <Text style={s.colLabel}>Bill To</Text>
            <Text style={s.colValue}>{clientName}</Text>
            <Text style={s.colValue}>{clientEmail}</Text>
            {clientPhone && <Text style={s.colValue}>{clientPhone}</Text>}
          </View>
          {paymentMethod && (
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={s.colLabel}>Payment Method</Text>
              <Text style={{ ...s.colValue, textTransform: 'capitalize' }}>{paymentMethod}</Text>
            </View>
          )}
        </View>

        {/* Table */}
        <View style={s.tableHeader}>
          <Text style={{ ...s.thText, ...s.colDesc }}>Description</Text>
          <Text style={{ ...s.thText, ...s.colQty }}>Qty</Text>
          <Text style={{ ...s.thText, ...s.colPrice }}>Unit Price</Text>
          <Text style={{ ...s.thText, ...s.colTotal }}>Total</Text>
        </View>
        {items.map((item, i) => (
          <View key={i} style={s.tableRow}>
            <Text style={s.colDesc}>{item.description}</Text>
            <Text style={s.colQty}>{item.qty}</Text>
            <Text style={s.colPrice}>${Number(item.unit_price).toFixed(2)}</Text>
            <Text style={s.colTotal}>${(item.qty * item.unit_price).toFixed(2)}</Text>
          </View>
        ))}

        {/* Totals */}
        <View style={s.subtotalRow}>
          <Text style={s.subtotalLabel}>Subtotal</Text>
          <Text style={s.subtotalValue}>${subtotal.toFixed(2)}</Text>
        </View>
        {tax != null && tax > 0 && (
          <View style={s.taxRow}>
            <Text style={s.taxLabel}>HST (13%)</Text>
            <Text style={s.taxValue}>${tax.toFixed(2)}</Text>
          </View>
        )}
        {transactionFee != null && transactionFee > 0 && (
          <View style={s.taxRow}>
            <Text style={s.taxLabel}>Card Fee (3%)</Text>
            <Text style={s.taxValue}>${transactionFee.toFixed(2)}</Text>
          </View>
        )}
        <View style={s.totalRow}>
          <Text style={s.totalLabel}>Total</Text>
          <Text style={s.totalValue}>${total.toFixed(2)}</Text>
        </View>

        {/* Notes */}
        {notes && (
          <View style={s.notesBox}>
            <Text style={s.notesLabel}>Notes</Text>
            <Text style={s.notesText}>{notes}</Text>
          </View>
        )}

        {/* Signature */}
        <View style={s.sigSection}>
          <View style={s.sigBox}>
            <Text style={s.sigLabel}>
              {type === 'ESTIMATE'
                ? 'By signing below, I accept this estimate and authorize Roofs Canada to proceed with the described work.'
                : 'By signing below, I confirm receipt of this invoice and agree to the payment terms.'}
            </Text>
            <View style={s.sigLine} />
            <Text style={s.sigSubLabel}>Client Signature</Text>
          </View>
          <View style={s.sigBox}>
            <Text style={s.sigLabel}> </Text>
            <View style={s.sigLine} />
            <Text style={s.sigSubLabel}>Date</Text>
          </View>
        </View>

        {/* Terms */}
        {terms && (
          <View style={s.termsBox}>
            <Text style={s.termsLabel}>Terms & Conditions</Text>
            <Text style={s.termsText}>{terms}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>{companyName} — {number}</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}


/* ─── Proposal PDF Types ─── */

export type ProposalFlashing = { type: string; isNew: boolean; reused: boolean; details: string };

export type ProposalPdfProps = {
  number: string;
  date: string;
  logoUrl?: string;
  companyName: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  job: { location: string; startDate: string; duration: string };
  roofConditions: {
    inspectionDate: string; squareFootage: number; roofHeight: string; roofSlope: string;
    plywoodSurface: string; numberOfLayers: number; roofShape: string; yearInstalled: number;
    skylights: string; currentlyLeaking: string; historyOfLeaking: string; leakDetails: string;
  };
  shingles: { type: string; year: string; colour: string; plywood: string };
  underlayment: {
    felt: string; vinylSynthetic: string;
    iceDamProtection: { leadingEdge: boolean; size: string };
    valley: string;
  };
  flashing: ProposalFlashing[];
  installationOptions: string[];
  lineItems: PdfLineItem[];
  exclusions: string;
  payment: { deposit: number; validDays: number };
  subtotal: number;
  notes?: string;
  terms?: string;
};

const ps = StyleSheet.create({
  sectionTitle: { fontSize: 10, fontWeight: 700, color: c.red, marginBottom: 6, marginTop: 16, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoRow: { flexDirection: 'row', marginBottom: 2 },
  infoLabel: { fontSize: 8, color: c.light, width: 110 },
  infoValue: { fontSize: 9, color: c.dark, flex: 1 },
  miniTableHeader: { flexDirection: 'row', backgroundColor: c.bg, padding: '4 6', borderRadius: 2, marginBottom: 1 },
  miniTableRow: { flexDirection: 'row', padding: '3 6', borderBottom: `0.5px solid ${c.border}` },
  checkCol: { width: 40, textAlign: 'center', fontSize: 9 },
  typeCol: { flex: 2, fontSize: 9 },
  detailCol: { flex: 3, fontSize: 9, color: c.mid },
  optionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  optionCheck: { fontSize: 9, color: c.red, width: 14 },
  optionText: { fontSize: 9, color: c.dark },
  acceptBox: { backgroundColor: c.bg, padding: 12, borderRadius: 4, marginTop: 16 },
  acceptTitle: { fontSize: 8, fontWeight: 700, color: c.dark, marginBottom: 4 },
  acceptText: { fontSize: 8, color: c.mid, lineHeight: 1.6 },
  withdrawNote: { fontSize: 7, color: c.light, textAlign: 'center', marginTop: 10 },
  payRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 4 },
  payLabel: { fontSize: 9, color: c.mid, marginRight: 16 },
  payValue: { fontSize: 10, color: c.dark, minWidth: 70, textAlign: 'right' },
});

function InfoRow({ label, value }: { label: string; value: string | number | undefined }) {
  if (!value && value !== 0) return null;
  return (
    <View style={ps.infoRow}>
      <Text style={ps.infoLabel}>{label}</Text>
      <Text style={ps.infoValue}>{String(value)}</Text>
    </View>
  );
}

export function ProposalPdfDocument(props: ProposalPdfProps) {
  const {
    number, date, logoUrl, companyName, companyAddress, companyPhone, companyEmail,
    clientName, clientEmail, clientPhone, job, roofConditions, shingles, underlayment,
    flashing, installationOptions, lineItems, exclusions, payment, subtotal, notes, terms,
  } = props;

  const balance = subtotal - (payment.deposit || 0);
  const activeFlashing = flashing.filter(f => f.isNew || f.reused || f.details);

  return (
    <Document>
      <Page size="LETTER" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View>
            {logoUrl
              ? <Image src={logoUrl} style={s.logo} />
              : <Text style={s.logoText}>{companyName}</Text>
            }
            {companyAddress && <Text style={{ ...s.colValue, marginTop: 6, color: c.mid }}>{companyAddress}</Text>}
            {companyPhone && <Text style={{ ...s.colValue, color: c.mid }}>{companyPhone}</Text>}
            {companyEmail && <Text style={{ ...s.colValue, color: c.mid }}>{companyEmail}</Text>}
          </View>
          <View style={s.docMeta}>
            <Text style={s.docType}>PROPOSAL</Text>
            <Text style={s.docNumber}>{number}</Text>
            <Text style={s.docDate}>{date}</Text>
          </View>
        </View>
        <View style={s.divider} />

        {/* Bill To + Job Info */}
        <View style={s.twoCol}>
          <View>
            <Text style={s.colLabel}>Client</Text>
            <Text style={s.colValue}>{clientName}</Text>
            <Text style={s.colValue}>{clientEmail}</Text>
            {clientPhone && <Text style={s.colValue}>{clientPhone}</Text>}
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={s.colLabel}>Job Information</Text>
            {job.location && <Text style={s.colValue}>{job.location}</Text>}
            {job.startDate && <Text style={s.colValue}>Start: {job.startDate}</Text>}
            {job.duration && <Text style={s.colValue}>Duration: {job.duration}</Text>}
          </View>
        </View>

        {/* Existing Roof Conditions */}
        <Text style={ps.sectionTitle}>Existing Roof Conditions</Text>
        <InfoRow label="Inspection Date" value={roofConditions.inspectionDate} />
        <InfoRow label="Square Footage" value={roofConditions.squareFootage ? `${roofConditions.squareFootage} sq ft` : undefined} />
        <InfoRow label="Roof Height" value={roofConditions.roofHeight} />
        <InfoRow label="Roof Slope" value={roofConditions.roofSlope} />
        <InfoRow label="Plywood Surface" value={roofConditions.plywoodSurface} />
        <InfoRow label="Number of Layers" value={roofConditions.numberOfLayers} />
        <InfoRow label="Roof Shape" value={roofConditions.roofShape} />
        <InfoRow label="Year Installed" value={roofConditions.yearInstalled || undefined} />
        <InfoRow label="Skylights" value={roofConditions.skylights} />
        <InfoRow label="Currently Leaking" value={roofConditions.currentlyLeaking} />
        <InfoRow label="History of Leaking" value={roofConditions.historyOfLeaking} />
        {roofConditions.leakDetails && <InfoRow label="Leak Details" value={roofConditions.leakDetails} />}

        {/* Shingles + Underlayment */}
        <View style={{ flexDirection: 'row', gap: 20 }}>
          <View style={{ flex: 1 }}>
            <Text style={ps.sectionTitle}>Shingles</Text>
            <InfoRow label="Type" value={shingles.type} />
            <InfoRow label="Year" value={shingles.year} />
            <InfoRow label="Colour" value={shingles.colour} />
            <InfoRow label="Plywood" value={shingles.plywood} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={ps.sectionTitle}>Underlayment</Text>
            <InfoRow label="Felt" value={underlayment.felt} />
            <InfoRow label="Vinyl/Synthetic" value={underlayment.vinylSynthetic} />
            <InfoRow label="Ice Dam" value={underlayment.iceDamProtection.leadingEdge ? `Leading Edge, ${underlayment.iceDamProtection.size}` : underlayment.iceDamProtection.size} />
            <InfoRow label="Valley" value={underlayment.valley} />
          </View>
        </View>

        {/* Flashing Table */}
        {activeFlashing.length > 0 && (
          <>
            <Text style={ps.sectionTitle}>Flashing</Text>
            <View style={ps.miniTableHeader}>
              <Text style={{ ...s.thText, ...ps.typeCol }}>Type</Text>
              <Text style={{ ...s.thText, ...ps.checkCol }}>New</Text>
              <Text style={{ ...s.thText, ...ps.checkCol }}>Reused</Text>
              <Text style={{ ...s.thText, ...ps.detailCol }}>Details</Text>
            </View>
            {activeFlashing.map((f, i) => (
              <View key={i} style={ps.miniTableRow}>
                <Text style={ps.typeCol}>{f.type}</Text>
                <Text style={ps.checkCol}>{f.isNew ? '✓' : '—'}</Text>
                <Text style={ps.checkCol}>{f.reused ? '✓' : '—'}</Text>
                <Text style={ps.detailCol}>{f.details || '—'}</Text>
              </View>
            ))}
          </>
        )}

        {/* Installation Options */}
        {installationOptions.length > 0 && (
          <>
            <Text style={ps.sectionTitle}>Installation Options</Text>
            {installationOptions.map((opt, i) => (
              <View key={i} style={ps.optionRow}>
                <Text style={ps.optionCheck}>✓</Text>
                <Text style={ps.optionText}>{opt}</Text>
              </View>
            ))}
          </>
        )}

        {/* Line Items Pricing */}
        <Text style={ps.sectionTitle}>Pricing</Text>
        <View style={s.tableHeader}>
          <Text style={{ ...s.thText, ...s.colDesc }}>Description</Text>
          <Text style={{ ...s.thText, ...s.colQty }}>Qty</Text>
          <Text style={{ ...s.thText, ...s.colPrice }}>Unit Price</Text>
          <Text style={{ ...s.thText, ...s.colTotal }}>Total</Text>
        </View>
        {lineItems.map((item, i) => (
          <View key={i} style={s.tableRow}>
            <Text style={s.colDesc}>{item.description}</Text>
            <Text style={s.colQty}>{item.qty}</Text>
            <Text style={s.colPrice}>${Number(item.unit_price).toFixed(2)}</Text>
            <Text style={s.colTotal}>${(item.qty * item.unit_price).toFixed(2)}</Text>
          </View>
        ))}

        {/* Payment */}
        <View style={s.subtotalRow}>
          <Text style={s.subtotalLabel}>Subtotal</Text>
          <Text style={s.subtotalValue}>${subtotal.toFixed(2)}</Text>
        </View>
        {payment.deposit > 0 && (
          <>
            <View style={ps.payRow}>
              <Text style={ps.payLabel}>Deposit</Text>
              <Text style={ps.payValue}>${payment.deposit.toFixed(2)}</Text>
            </View>
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Balance Owing</Text>
              <Text style={s.totalValue}>${balance.toFixed(2)}</Text>
            </View>
          </>
        )}
        {payment.deposit <= 0 && (
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Total</Text>
            <Text style={s.totalValue}>${subtotal.toFixed(2)}</Text>
          </View>
        )}

        {/* Exclusions */}
        {exclusions && (
          <View style={s.notesBox}>
            <Text style={s.notesLabel}>Exclusions / Additional Charges</Text>
            <Text style={s.notesText}>{exclusions}</Text>
          </View>
        )}

        {/* Notes */}
        {notes && (
          <View style={{ ...s.notesBox, marginTop: 8 }}>
            <Text style={s.notesLabel}>Notes</Text>
            <Text style={s.notesText}>{notes}</Text>
          </View>
        )}

        {/* Acceptance */}
        <View style={ps.acceptBox}>
          <Text style={ps.acceptTitle}>Proposal</Text>
          <Text style={ps.acceptText}>
            We Propose hereby to furnish material and labour — complete in accordance with above specifications.
          </Text>
          <Text style={{ ...ps.acceptTitle, marginTop: 8 }}>Acceptance of Proposal</Text>
          <Text style={ps.acceptText}>
            The specifications and conditions are satisfactory and are hereby accepted. You are authorized to do the work as specified. Payment will be made as outlined.
          </Text>
        </View>

        {/* Signatures */}
        <View style={s.sigSection}>
          <View style={s.sigBox}>
            <Text style={s.sigLabel}> </Text>
            <View style={s.sigLine} />
            <Text style={s.sigSubLabel}>Client Signature</Text>
          </View>
          <View style={s.sigBox}>
            <Text style={s.sigLabel}> </Text>
            <View style={s.sigLine} />
            <Text style={s.sigSubLabel}>Date</Text>
          </View>
        </View>
        <View style={{ ...s.sigSection, marginTop: 12 }}>
          <View style={s.sigBox}>
            <View style={s.sigLine} />
            <Text style={s.sigSubLabel}>Authorized Signature</Text>
          </View>
          <View style={s.sigBox} />
        </View>

        {/* Withdrawal Note */}
        <Text style={ps.withdrawNote}>
          Note: This proposal may be withdrawn by {companyName} if not accepted within {payment.validDays || 30} days.
        </Text>

        {/* Terms */}
        {terms && (
          <View style={s.termsBox}>
            <Text style={s.termsLabel}>Terms & Conditions</Text>
            <Text style={s.termsText}>{terms}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>{companyName} — {number}</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
