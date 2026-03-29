'use client';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Lead = { id: string; name: string; email: string; service_type: string };
type LineItem = { description: string; qty: number; unit_price: number };

// Inner component reads searchParams — must be inside Suspense
function NewEstimateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedLeadId = searchParams.get('lead_id') ?? '';

  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadId, setLeadId] = useState(preselectedLeadId);
  const [items, setItems] = useState<LineItem[]>([{ description: '', qty: 1, unit_price: 0 }]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/leads').then(r => r.json()).then(setLeads).catch(() => toast.error('Failed to load leads'));
  }, []);

  const addItem = () => setItems(prev => [...prev, { description: '', qty: 1, unit_price: 0 }]);
  const removeItem = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof LineItem, value: string | number) =>
    setItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item));

  const subtotal = items.reduce((s, i) => s + i.qty * i.unit_price, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadId) { toast.error('Select a lead'); return; }
    if (items.some(i => !i.description)) { toast.error('All line items need a description'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/estimates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: leadId, items, notes }),
      });
      if (!res.ok) throw new Error((await res.json()).detail);
      const est = await res.json();
      toast.success('Estimate created');
      router.push(`/admin/estimates/${est.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create estimate');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">New Estimate</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-md p-6 space-y-4">
            <h2 className="font-medium text-slate-800">Client</h2>
            <div>
              <Label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Select Lead</Label>
              <Select onValueChange={setLeadId} value={leadId} required>
                <SelectTrigger className="mt-1 border-slate-300">
                  <SelectValue placeholder="Choose a lead..." />
                </SelectTrigger>
                <SelectContent>
                  {leads.map(l => (
                    <SelectItem key={l.id} value={l.id}>{l.name} — {l.email} ({l.service_type})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-md p-6 space-y-4">
            <h2 className="font-medium text-slate-800">Line Items</h2>
            <div className="space-y-3">
              {items.map((item, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-start">
                  <div className="col-span-12 sm:col-span-6">
                    <Input placeholder="Description" value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} className="border-slate-300" required />
                  </div>
                  <div className="col-span-4 sm:col-span-2">
                    <Input type="number" min="1" placeholder="Qty" value={item.qty} onChange={e => updateItem(i, 'qty', Number(e.target.value))} className="border-slate-300" />
                  </div>
                  <div className="col-span-6 sm:col-span-3">
                    <Input type="number" min="0" step="0.01" placeholder="Unit price" value={item.unit_price} onChange={e => updateItem(i, 'unit_price', Number(e.target.value))} className="border-slate-300" />
                  </div>
                  <div className="col-span-2 sm:col-span-1 flex items-center justify-end">
                    {items.length > 1 && (
                      <button type="button" onClick={() => removeItem(i)} className="text-slate-400 hover:text-red-600 p-1">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Button type="button" variant="outline" onClick={addItem} className="gap-2 border-slate-300 text-slate-600 text-sm">
              <Plus className="h-4 w-4" /> Add Line Item
            </Button>
            <div className="border-t border-slate-100 pt-4 flex justify-end">
              <div className="text-right">
                <p className="text-sm text-slate-500">Subtotal</p>
                <p className="text-2xl font-bold text-slate-900">${subtotal.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-md p-6">
            <Label htmlFor="notes" className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Notes (optional)</Label>
            <Textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="mt-1 border-slate-300 resize-none" placeholder="Any additional notes for the client..." />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()} className="border-slate-300">Cancel</Button>
            <Button type="submit" disabled={saving} className="bg-red-600 hover:bg-red-700 text-white px-8">
              {saving ? 'Creating...' : 'Create Estimate'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NewEstimatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600" />
      </div>
    }>
      <NewEstimateForm />
    </Suspense>
  );
}
