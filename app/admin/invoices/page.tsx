'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { Receipt } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type Invoice = {
  id: string; number: string; lead_name: string; lead_email: string;
  subtotal: number; tax: number; transaction_fee: number; total: number;
  status: string; payment_method: string | null; created_at: string; paid_at: string | null;
};

const statusStyle: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-green-100 text-green-700',
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/invoices').then(r => r.json()).then(setInvoices)
      .catch(() => toast.error('Failed to load invoices'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600" /></div>;

  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.total), 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-24 py-8 md:py-12">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">Invoices</h1>
          <p className="text-slate-500 text-sm mt-1">Track payments from converted estimates</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-slate-200 p-4 md:p-6 rounded-md shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-1">Total Invoices</p>
            <p className="text-2xl font-bold text-slate-900">{invoices.length}</p>
          </div>
          <div className="bg-white border border-slate-200 p-4 md:p-6 rounded-md shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-1">Paid</p>
            <p className="text-2xl font-bold text-green-600">{invoices.filter(i => i.status === 'paid').length}</p>
          </div>
          <div className="bg-white border border-slate-200 p-4 md:p-6 rounded-md shadow-sm col-span-2 md:col-span-1">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-1">Revenue Collected</p>
            <p className="text-2xl font-bold text-slate-900">${totalRevenue.toFixed(2)}</p>
          </div>
        </div>

        {invoices.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-md p-12 text-center">
            <Receipt className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No invoices yet. Convert an accepted estimate to create one.</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {['Invoice', 'Client', 'Subtotal', 'Tax', 'Fee', 'Total', 'Method', 'Status', 'Date', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono font-medium text-slate-800">{inv.number}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{inv.lead_name}</p>
                        <p className="text-xs text-slate-500">{inv.lead_email}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-700">${Number(inv.subtotal).toFixed(2)}</td>
                      <td className="px-4 py-3 text-slate-500">${Number(inv.tax).toFixed(2)}</td>
                      <td className="px-4 py-3 text-slate-500">${Number(inv.transaction_fee).toFixed(2)}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">${Number(inv.total).toFixed(2)}</td>
                      <td className="px-4 py-3 text-slate-600 capitalize">{inv.payment_method ?? '—'}</td>
                      <td className="px-4 py-3"><Badge className={statusStyle[inv.status] ?? statusStyle.pending}>{inv.status}</Badge></td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{formatDistanceToNow(new Date(inv.created_at), { addSuffix: true })}</td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/invoices/${inv.id}`} className="text-red-600 hover:text-red-700 text-xs font-medium">View →</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
