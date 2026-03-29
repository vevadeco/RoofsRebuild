'use client';
import { useEffect, useState } from 'react';
import { formatDistanceToNow, subDays, format } from 'date-fns';
import { toast } from 'sonner';
import Link from 'next/link';
import { useAuth } from '@/lib/useAuth';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, TrendingUp, Users, CheckCircle, Clock } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

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

function buildChartData(leads: Lead[]) {
  // Last 14 days
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = subDays(new Date(), 13 - i);
    return { date: format(d, 'MMM d'), key: format(d, 'yyyy-MM-dd'), count: 0 };
  });
  leads.forEach((l) => {
    const key = format(new Date(l.created_at), 'yyyy-MM-dd');
    const day = days.find((d) => d.key === key);
    if (day) day.count++;
  });
  return days;
}

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

  const conversionRate = stats.total > 0
    ? Math.round((stats.converted / stats.total) * 100)
    : 0;

  const chartData = buildChartData(leads);

  // Service breakdown
  const serviceBreakdown = leads.reduce<Record<string, number>>((acc, l) => {
    acc[l.service_type] = (acc[l.service_type] ?? 0) + 1;
    return acc;
  }, {});
  const topServices = Object.entries(serviceBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

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
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 mb-2">Dashboard</h1>
          <p className="text-base text-slate-600">Welcome back, {user?.name ?? 'Admin'}</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Leads', value: stats.total, color: 'text-slate-900', icon: Users },
            { label: 'New', value: stats.new, color: 'text-blue-600', icon: Clock },
            { label: 'Contacted', value: stats.contacted, color: 'text-yellow-600', icon: TrendingUp },
            { label: 'Converted', value: stats.converted, color: 'text-green-600', icon: CheckCircle },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-slate-200 p-4 md:p-6 rounded-md shadow-sm flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">{s.label}</p>
                <p className={`text-2xl md:text-3xl font-bold ${s.color}`}>{s.value}</p>
              </div>
              <s.icon className={`h-5 w-5 mt-1 ${s.color} opacity-40`} />
            </div>
          ))}
        </div>

        {/* Analytics row */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Leads over time */}
          <div className="md:col-span-2 bg-white border border-slate-200 rounded-md shadow-sm p-5">
            <p className="text-sm font-semibold text-slate-700 mb-4">Leads — Last 14 Days</p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={chartData} barSize={14}>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} interval={1} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={20} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #E2E8F0' }}
                  cursor={{ fill: '#F8FAFC' }}
                />
                <Bar dataKey="count" name="Leads" radius={[3, 3, 0, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={_ .count > 0 ? '#DC2626' : '#E2E8F0'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Right column: conversion + top services */}
          <div className="flex flex-col gap-4">
            {/* Conversion rate */}
            <div className="bg-white border border-slate-200 rounded-md shadow-sm p-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-3">Conversion Rate</p>
              <p className="text-3xl font-bold text-slate-900">{conversionRate}%</p>
              <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${conversionRate}%` }} />
              </div>
              <p className="text-xs text-slate-400 mt-2">{stats.converted} of {stats.total} leads converted</p>
            </div>

            {/* Top services */}
            {topServices.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-md shadow-sm p-5 flex-1">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-3">Top Services</p>
                <div className="space-y-2">
                  {topServices.map(([service, count]) => (
                    <div key={service} className="flex items-center justify-between">
                      <span className="text-xs text-slate-600 truncate max-w-[140px]">{service}</span>
                      <span className="text-xs font-semibold text-slate-800 ml-2">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Leads table */}
        <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
          <div className="p-4 md:p-6 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-lg md:text-xl font-medium tracking-tight text-slate-800">All Leads</h2>
            <Link
              href="/admin/estimates/new"
              className="text-xs font-medium text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              <FileText className="h-3.5 w-3.5" /> New Estimate
            </Link>
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
                <TableHead>Status Action</TableHead>
                <TableHead>Estimate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-slate-500 py-8">No leads yet</TableCell>
                </TableRow>
              ) : (
                leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="text-sm text-slate-600 whitespace-nowrap">
                      {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900 whitespace-nowrap">{lead.name}</TableCell>
                    <TableCell className="text-slate-600">{lead.email}</TableCell>
                    <TableCell className="text-slate-600 whitespace-nowrap">{lead.phone}</TableCell>
                    <TableCell className="text-slate-600 whitespace-nowrap">{lead.service_type}</TableCell>
                    <TableCell className="text-slate-600 max-w-[180px] truncate">{lead.message}</TableCell>
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
                    <TableCell>
                      <Link
                        href={`/admin/estimates/new?lead_id=${lead.id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-white bg-red-600 hover:bg-red-700 transition-colors px-2.5 py-1.5 rounded-md whitespace-nowrap"
                      >
                        <FileText className="h-3 w-3" /> Create Estimate
                      </Link>
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
