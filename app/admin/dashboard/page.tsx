'use client';
import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { useAuth } from '@/lib/useAuth';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  service_type: string;
  message: string;
  status: string;
  created_at: string;
};

const statusStyles: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  converted: 'bg-green-100 text-green-700',
};

export default function AdminDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetch('/api/leads')
      .then((r) => r.json())
      .then(setLeads)
      .catch(() => toast.error('Failed to load leads'))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/leads/${id}?status=${status}`, { method: 'PATCH' });
      if (!res.ok) throw new Error();
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const stats = {
    total: leads.length,
    new: leads.filter((l) => l.status === 'new').length,
    contacted: leads.filter((l) => l.status === 'contacted').length,
    converted: leads.filter((l) => l.status === 'converted').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto" />
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-24 py-8 md:py-12">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 mb-2">Lead Dashboard</h1>
          <p className="text-base text-slate-600">Welcome back, {user?.name ?? 'Admin'}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          {[
            { label: 'Total Leads', value: stats.total, color: 'text-slate-900' },
            { label: 'New', value: stats.new, color: 'text-blue-600' },
            { label: 'Contacted', value: stats.contacted, color: 'text-yellow-600' },
            { label: 'Converted', value: stats.converted, color: 'text-green-600' },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-slate-200 p-4 md:p-6 rounded-md shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">{s.label}</p>
              <p className={`text-2xl md:text-3xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
          <div className="p-4 md:p-6 border-b border-slate-200">
            <h2 className="text-lg md:text-xl font-medium tracking-tight text-slate-800">All Leads</h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-slate-500 py-8">No leads yet</TableCell>
                </TableRow>
              ) : (
                leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="text-sm text-slate-600">
                      {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">{lead.name}</TableCell>
                    <TableCell className="text-slate-600">{lead.email}</TableCell>
                    <TableCell className="text-slate-600">{lead.phone}</TableCell>
                    <TableCell className="text-slate-600">{lead.service_type}</TableCell>
                    <TableCell className="text-slate-600 max-w-xs truncate">{lead.message}</TableCell>
                    <TableCell>
                      <Badge className={statusStyles[lead.status] ?? statusStyles.new}>{lead.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Select onValueChange={(v) => updateStatus(lead.id, v)} value={lead.status}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="contacted">Contacted</SelectItem>
                          <SelectItem value="converted">Converted</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
