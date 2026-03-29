'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Send, FileCheck, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type Estimate = {
  id: string; number: string; status: string; subtotal: number; notes: string;
  lead_name: string; lead_email: string; lead_phone: string; service_type: string;
  items: { description: string; qty: number; unit_price: number }[];
  created_at: string; sent_at: string | null; accepted_at: string | null;
};

const statusStyle: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600',
  sent: 'bg-blue-100 text-blue-700',
  accepted: 'bg-green-100 text-green-700',
  declined: 'bg-red-100 text-red-700',
  converted: 'bg-purple-100 text-purple-700',
};

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
      toast.success(`Estimate sent to ${est?.lead_email}`);
      setEst(prev => prev ? { ...prev, status: 'sent' } : prev);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  const markAccepted = async () => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/estimates/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'accepted' }),
      });
      if (!res.ok) throw new Error();
      toast.success('Marked as accepted');
      setEst(prev => prev ? { ...prev, status: 'accepted' } : prev);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
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
    } finally {
      setConverting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600" /></div>;
  if (!est) return <div className="min-h-screen flex items-center justify-center text-slate-500">Estimate not found</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-12">
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

        {/* Estimate card */}
        <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50">
            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Service</p>
            <p className="text-slate-800 font-medium mt-1">{est.service_type}</p>
          </div>

          <table className="w-full text-sm">
            <thead className="border-b border-slate-100">
              <tr className="text-xs uppercase tracking-wider text-slate-500">
                <th className="px-6 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-center">Qty</th>
                <th className="px-4 py-3 text-right">Unit Price</th>
                <th className="px-6 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {est.items.map((item, i) => (
                <tr key={i}>
                  <td className="px-6 py-4 text-slate-700">{item.description}</td>
                  <td className="px-4 py-4 text-center text-slate-600">{item.qty}</td>
                  <td className="px-4 py-4 text-right text-slate-600">${Number(item.unit_price).toFixed(2)}</td>
                  <td className="px-6 py-4 text-right font-medium text-slate-800">${(item.qty * item.unit_price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t border-slate-200 bg-slate-50">
              <tr>
                <td colSpan={3} className="px-6 py-4 text-right font-semibold text-slate-700">Subtotal</td>
                <td className="px-6 py-4 text-right font-bold text-xl text-slate-900">${Number(est.subtotal).toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>

          {est.notes && (
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50">
              <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1">Notes</p>
              <p className="text-sm text-slate-700">{est.notes}</p>
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
