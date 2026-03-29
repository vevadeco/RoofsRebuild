'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { Plus, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type Estimate = {
  id: string; number: string; lead_name: string; lead_email: string;
  service_type: string; subtotal: number; status: string; created_at: string;
};

const statusStyle: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600',
  sent: 'bg-blue-100 text-blue-700',
  accepted: 'bg-green-100 text-green-700',
  declined: 'bg-red-100 text-red-700',
  converted: 'bg-purple-100 text-purple-700',
};

export default function EstimatesPage() {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/estimates').then(r => r.json()).then(setEstimates)
      .catch(() => toast.error('Failed to load estimates'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600" /></div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-24 py-8 md:py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">Estimates</h1>
            <p className="text-slate-500 text-sm mt-1">Create and manage estimates for your leads</p>
          </div>
          <Link href="/admin/estimates/new">
            <Button className="bg-red-600 hover:bg-red-700 text-white gap-2">
              <Plus className="h-4 w-4" /> New Estimate
            </Button>
          </Link>
        </div>

        {estimates.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-md p-12 text-center">
            <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No estimates yet. Create one from a lead.</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {['Number', 'Client', 'Service', 'Subtotal', 'Status', 'Created', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {estimates.map(e => (
                    <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono font-medium text-slate-800">{e.number}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{e.lead_name}</p>
                        <p className="text-xs text-slate-500">{e.lead_email}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{e.service_type}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">${Number(e.subtotal).toFixed(2)}</td>
                      <td className="px-4 py-3"><Badge className={statusStyle[e.status] ?? statusStyle.draft}>{e.status}</Badge></td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{formatDistanceToNow(new Date(e.created_at), { addSuffix: true })}</td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/estimates/${e.id}`} className="text-red-600 hover:text-red-700 text-xs font-medium">View →</Link>
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
