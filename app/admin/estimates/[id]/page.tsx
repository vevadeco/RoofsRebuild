'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Send, FileCheck, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type FlashingRow = { type: string; isNew: boolean; reused: boolean; details: string };
type LineItem = { description: string; qty: number; unit_price: number };

type ProposalItems = {
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
  flashing: FlashingRow[];
  installationOptions: string[];
  lineItems: LineItem[];
  exclusions: string;
  payment: { deposit: number; validDays: number };
};

type Estimate = {
  id: string; number: string; status: string; subtotal: number; notes: string;
  lead_name: string; lead_email: string; lead_phone: string; service_type: string;
  items: ProposalItems;
  created_at: string; sent_at: string | null; accepted_at: string | null;
};

const statusStyle: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600',
  sent: 'bg-blue-100 text-blue-700',
  accepted: 'bg-green-100 text-green-700',
  declined: 'bg-red-100 text-red-700',
  converted: 'bg-purple-100 text-purple-700',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-slate-100 px-6 py-5">
      <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-3">{title}</p>
      {children}
    </div>
  );
}

function InfoGrid({ items }: { items: [string, string | number | undefined][] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-sm">
      {items.filter(([, v]) => v !== undefined && v !== '' && v !== 0).map(([label, value]) => (
        <div key={label}>
          <span className="text-slate-500">{label}:</span>{' '}
          <span className="text-slate-800 font-medium">{value}</span>
        </div>
      ))}
    </div>
  );
}

export default function EstimateDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [est, setEst] = useState<Estimate | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [converting, setConverting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetch(`/api/estimates/${params.id}`).then(r => r.json()).then(setEst)
      .catch(() => toast.error('Failed to load estimate'))
      .finally(() => setLoading(false));
  }, [params.id]);

  const sendEstimate = async () => {
    setSending(true);
    try {
      const res = await fetch(`/api/estimates/${params.id}/send`, { method: 'POST' });
      if (!res.ok) throw new Error((await res.json()).detail);
      toast.success(`Proposal sent to ${est?.lead_email}`);
      setEst(prev => prev ? { ...prev, status: 'sent' } : prev);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send');
    } finally { setSending(false); }
  };

  const markAccepted = async () => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/estimates/${params.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'accepted' }),
      });
      if (!res.ok) throw new Error();
      toast.success('Marked as accepted');
      setEst(prev => prev ? { ...prev, status: 'accepted' } : prev);
    } catch { toast.error('Failed to update status'); }
    finally { setUpdatingStatus(false); }
  };

  const convertToInvoice = async () => {
    setConverting(true);
    try {
      const res = await fetch(`/api/estimates/${params.id}/convert`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) { router.push(`/admin/invoices/${data.invoice_id}`); return; }
        throw new Error(data.detail);
      }
      toast.success('Invoice created');
      router.push(`/admin/invoices/${data.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to convert');
    } finally { setConverting(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600" /></div>;
  if (!est) return <div className="min-h-screen flex items-center justify-center text-slate-500">Estimate not found</div>;

  const p = est.items;
  const hasProposalData = p && p.job;
  const lineItems = hasProposalData ? (p.lineItems || []) : (Array.isArray(est.items) ? est.items as unknown as LineItem[] : []);
  const subtotal = Number(est.subtotal);
  const deposit = hasProposalData ? (p.payment?.deposit || 0) : 0;
  const balance = subtotal - deposit;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-semibold text-slate-900">{est.number}</h1>
              <Badge className={statusStyle[est.status] ?? statusStyle.draft}>{est.status}</Badge>
            </div>
            <p className="text-slate-500 text-sm">{est.lead_name} · {est.lead_email} · {est.lead_phone}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {est.status === 'draft' && (
              <Button onClick={sendEstimate} disabled={sending} className="bg-blue-600 hover:bg-blue-700 text-white gap-2 text-sm">
                <Send className="h-4 w-4" /> {sending ? 'Sending...' : 'Send to Client'}
              </Button>
            )}
            {est.status === 'sent' && (
              <Button onClick={markAccepted} disabled={updatingStatus} variant="outline" className="gap-2 text-sm border-green-300 text-green-700 hover:bg-green-50">
                <FileCheck className="h-4 w-4" /> {updatingStatus ? 'Updating...' : 'Mark Accepted'}
              </Button>
            )}
            {(est.status === 'accepted' || est.status === 'sent') && (
              <Button onClick={convertToInvoice} disabled={converting} className="bg-red-600 hover:bg-red-700 text-white gap-2 text-sm">
                <ArrowRight className="h-4 w-4" /> {converting ? 'Converting...' : 'Convert to Invoice'}
              </Button>
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
          {/* Service */}
          <div className="p-6 border-b border-slate-100 bg-slate-50">
            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Service</p>
            <p className="text-slate-800 font-medium mt-1">{est.service_type}</p>
          </div>

          {hasProposalData && (
            <>
              {/* Job Info */}
              <Section title="Job Information">
                <InfoGrid items={[
                  ['Location', p.job.location],
                  ['Start Date', p.job.startDate],
                  ['Duration', p.job.duration],
                ]} />
              </Section>

              {/* Roof Conditions */}
              <Section title="Existing Roof Conditions">
                <InfoGrid items={[
                  ['Inspection Date', p.roofConditions.inspectionDate],
                  ['Square Footage', p.roofConditions.squareFootage ? `${p.roofConditions.squareFootage} sq ft` : undefined],
                  ['Roof Height', p.roofConditions.roofHeight],
                  ['Roof Slope', p.roofConditions.roofSlope],
                  ['Plywood Surface', p.roofConditions.plywoodSurface],
                  ['Layers', p.roofConditions.numberOfLayers],
                  ['Roof Shape', p.roofConditions.roofShape],
                  ['Year Installed', p.roofConditions.yearInstalled],
                  ['Skylights', p.roofConditions.skylights],
                  ['Currently Leaking', p.roofConditions.currentlyLeaking],
                  ['History of Leaking', p.roofConditions.historyOfLeaking],
                ]} />
                {p.roofConditions.leakDetails && (
                  <p className="mt-2 text-sm text-slate-600"><span className="text-slate-500">Leak Details:</span> {p.roofConditions.leakDetails}</p>
                )}
              </Section>

              {/* Shingles */}
              <Section title="Shingles">
                <InfoGrid items={[
                  ['Type', p.shingles.type],
                  ['Year', p.shingles.year],
                  ['Colour', p.shingles.colour],
                  ['Plywood', p.shingles.plywood],
                ]} />
              </Section>

              {/* Underlayment */}
              <Section title="Underlayment">
                <InfoGrid items={[
                  ['Felt', p.underlayment.felt],
                  ['Vinyl/Synthetic', p.underlayment.vinylSynthetic],
                  ['Ice Dam Protection', p.underlayment.iceDamProtection.leadingEdge ? `Leading Edge, ${p.underlayment.iceDamProtection.size}` : p.underlayment.iceDamProtection.size],
                  ['Valley', p.underlayment.valley],
                ]} />
              </Section>

              {/* Flashing */}
              {p.flashing?.some(f => f.isNew || f.reused || f.details) && (
                <Section title="Flashing">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">
                        <th className="py-2 text-left font-semibold">Type</th>
                        <th className="py-2 text-center font-semibold w-16">New</th>
                        <th className="py-2 text-center font-semibold w-16">Reused</th>
                        <th className="py-2 text-left font-semibold">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {p.flashing.filter(f => f.isNew || f.reused || f.details).map(f => (
                        <tr key={f.type}>
                          <td className="py-2 text-slate-700">{f.type}</td>
                          <td className="py-2 text-center">{f.isNew ? '✓' : '—'}</td>
                          <td className="py-2 text-center">{f.reused ? '✓' : '—'}</td>
                          <td className="py-2 text-slate-600">{f.details || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Section>
              )}

              {/* Installation Options */}
              {p.installationOptions?.length > 0 && (
                <Section title="Installation Options">
                  <ul className="space-y-1 text-sm text-slate-700">
                    {p.installationOptions.map((opt: string) => (
                      <li key={opt} className="flex items-center gap-2">
                        <span className="text-green-600">✓</span> {opt}
                      </li>
                    ))}
                  </ul>
                </Section>
              )}
            </>
          )}

          {/* Line Items Table */}
          <Section title="Pricing">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100">
                <tr className="text-xs uppercase tracking-wider text-slate-500">
                  <th className="py-2 text-left">Description</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Unit Price</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {lineItems.map((item: LineItem, i: number) => (
                  <tr key={i}>
                    <td className="py-3 text-slate-700">{item.description}</td>
                    <td className="py-3 text-center text-slate-600">{item.qty}</td>
                    <td className="py-3 text-right text-slate-600">${Number(item.unit_price).toFixed(2)}</td>
                    <td className="py-3 text-right font-medium text-slate-800">${(item.qty * item.unit_price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          {/* Payment Summary */}
          <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
            <div className="flex flex-col items-end gap-1 text-sm">
              <div className="flex gap-4"><span className="text-slate-500">Subtotal:</span><span className="font-semibold text-slate-900 w-24 text-right">${subtotal.toFixed(2)}</span></div>
              {hasProposalData && deposit > 0 && (
                <>
                  <div className="flex gap-4"><span className="text-slate-500">Deposit:</span><span className="text-slate-700 w-24 text-right">${deposit.toFixed(2)}</span></div>
                  <div className="flex gap-4"><span className="text-slate-500">Balance Owing:</span><span className="font-bold text-lg text-slate-900 w-24 text-right">${balance.toFixed(2)}</span></div>
                </>
              )}
              {(!hasProposalData || deposit === 0) && (
                <div className="flex gap-4"><span className="text-slate-500">Total:</span><span className="font-bold text-xl text-slate-900 w-24 text-right">${subtotal.toFixed(2)}</span></div>
              )}
            </div>
          </div>

          {/* Exclusions */}
          {hasProposalData && p.exclusions && (
            <Section title="Exclusions / Additional Charges">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{p.exclusions}</p>
            </Section>
          )}

          {/* Notes */}
          {est.notes && (
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50">
              <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1">Notes</p>
              <p className="text-sm text-slate-700">{est.notes}</p>
            </div>
          )}

          {/* Proposal validity */}
          {hasProposalData && p.payment?.validDays && (
            <div className="px-6 py-3 border-t border-slate-100 text-xs text-slate-400 text-center">
              This proposal is valid for {p.payment.validDays} days from the date of issue.
            </div>
          )}
        </div>

        <div className="mt-4 text-center">
          <Link href="/admin/estimates" className="text-sm text-slate-500 hover:text-red-600 transition-colors">← Back to Estimates</Link>
        </div>
      </div>
    </div>
  );
}
