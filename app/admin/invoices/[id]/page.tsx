'use client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ExternalLink, Copy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type Invoice = {
  id: string; number: string; status: string; payment_method: string | null;
  subtotal: number; tax: number; transaction_fee: number; total: number;
  lead_name: string; lead_email: string; lead_phone: string;
  estimate_number: string; items: { description: string; qty: number; unit_price: number }[];
  notes: string; created_at: string; paid_at: string | null;
};

export default function InvoiceAdminDetailPage({ params }: { params: { id: string } }) {
  const [inv, setInv] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/invoices/${params.id}`).then(r => r.json()).then(setInv)
      .catch(() => toast.error('Failed to load invoice'))
      .finally(() => setLoading(false));
  }, [params.id]);

  const paymentLink = typeof window !== 'undefined' ? `${window.location.origin}/invoice/${params.id}` : '';

  const copyLink = () => {
    navigator.clipboard.writeText(paymentLink);
    toast.success('Payment link copied');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600" /></div>;
  if (!inv) return <div className="min-h-screen flex items-center justify-center text-slate-500">Invoice not found</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-semibold text-slate-900">{inv.number}</h1>
              <Badge className={inv.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>{inv.status}</Badge>
            </div>
            <p className="text-slate-500 text-sm">{inv.lead_name} · {inv.lead_email}</p>
            <p className="text-slate-400 text-xs mt-0.5">From estimate {inv.estimate_number}</p>
          </div>
          {inv.status === 'pending' && (
            <div className="flex gap-2">
              <Button onClick={copyLink} variant="outline" className="gap-2 text-sm border-slate-300">
                <Copy className="h-4 w-4" /> Copy Payment Link
              </Button>
              <a href={paymentLink} target="_blank" rel="noreferrer">
                <Button variant="outline" className="gap-2 text-sm border-slate-300">
                  <ExternalLink className="h-4 w-4" /> Open
                </Button>
              </a>
            </div>
          )}
        </div>

        {/* Payment link box */}
        {inv.status === 'pending' && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-blue-800">Client Payment Link</p>
              <p className="text-xs text-blue-600 mt-0.5 break-all">{paymentLink}</p>
            </div>
            <button onClick={copyLink} className="text-blue-600 hover:text-blue-800 shrink-0">
              <Copy className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Invoice card */}
        <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr className="text-xs uppercase tracking-wider text-slate-500">
                <th className="px-6 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-center">Qty</th>
                <th className="px-4 py-3 text-right">Unit Price</th>
                <th className="px-6 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {inv.items.map((item, i) => (
                <tr key={i}>
                  <td className="px-6 py-4 text-slate-700">{item.description}</td>
                  <td className="px-4 py-4 text-center text-slate-600">{item.qty}</td>
                  <td className="px-4 py-4 text-right text-slate-600">${Number(item.unit_price).toFixed(2)}</td>
                  <td className="px-6 py-4 text-right font-medium text-slate-800">${(item.qty * item.unit_price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t border-slate-200 bg-slate-50 text-sm">
              <tr><td colSpan={3} className="px-6 py-2 text-right text-slate-600">Subtotal</td><td className="px-6 py-2 text-right font-medium">${Number(inv.subtotal).toFixed(2)}</td></tr>
              {Number(inv.tax) > 0 && <tr><td colSpan={3} className="px-6 py-2 text-right text-slate-600">HST (13%)</td><td className="px-6 py-2 text-right">${Number(inv.tax).toFixed(2)}</td></tr>}
              {Number(inv.transaction_fee) > 0 && <tr><td colSpan={3} className="px-6 py-2 text-right text-slate-600">Card Fee (3%)</td><td className="px-6 py-2 text-right">${Number(inv.transaction_fee).toFixed(2)}</td></tr>}
              <tr className="border-t border-slate-200"><td colSpan={3} className="px-6 py-4 text-right font-bold text-slate-700">Total</td><td className="px-6 py-4 text-right font-bold text-xl text-slate-900">${Number(inv.total).toFixed(2)}</td></tr>
            </tfoot>
          </table>
          {inv.notes && <div className="px-6 py-4 border-t border-slate-100 bg-slate-50"><p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1">Notes</p><p className="text-sm text-slate-700">{inv.notes}</p></div>}
          {inv.paid_at && <div className="px-6 py-4 border-t border-green-100 bg-green-50"><p className="text-sm text-green-700 font-medium">✓ Paid via {inv.payment_method} on {new Date(inv.paid_at).toLocaleDateString('en-CA', { dateStyle: 'long' })}</p></div>}
        </div>

        <div className="mt-4 text-center">
          <Link href="/admin/invoices" className="text-sm text-slate-500 hover:text-red-600 transition-colors">← Back to Invoices</Link>
        </div>
      </div>
    </div>
  );
}
