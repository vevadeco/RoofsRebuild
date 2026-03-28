'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export function LeadForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', service_type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      // Fire FB Lead event if pixel is loaded
      if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('track', 'Lead');
      }
      toast.success("Thank you! We'll contact you soon.");
      setForm({ name: '', email: '', phone: '', service_type: '', message: '' });
    } catch {
      toast.error('Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5 sm:p-8 rounded-lg">
      <h3 className="text-2xl font-semibold text-slate-900 mb-6 tracking-tight">Get a Free Quote</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name" className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Name</Label>
          <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="mt-1 border-slate-300" />
        </div>
        <div>
          <Label htmlFor="email" className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Email</Label>
          <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="mt-1 border-slate-300" />
        </div>
        <div>
          <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Phone</Label>
          <Input id="phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required className="mt-1 border-slate-300" />
        </div>
        <div>
          <Label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Service Type</Label>
          <Select onValueChange={(v) => setForm({ ...form, service_type: v })} value={form.service_type} required>
            <SelectTrigger className="mt-1 border-slate-300">
              <SelectValue placeholder="Select a service" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Leak & Roof Repair">Leak & Roof Repair</SelectItem>
              <SelectItem value="Roof Reshingling">Roof Reshingling</SelectItem>
              <SelectItem value="Metal Roof Installation">Metal Roof Installation</SelectItem>
              <SelectItem value="Flat Roof Installation">Flat Roof Installation</SelectItem>
              <SelectItem value="Euroshield Rubber Shingles">Euroshield Rubber Shingles</SelectItem>
              <SelectItem value="Skylights & Solar Tubes">Skylights & Solar Tubes</SelectItem>
              <SelectItem value="Gutters & Gutter Guard">Gutters & Gutter Guard</SelectItem>
              <SelectItem value="Siding Installation">Siding Installation</SelectItem>
              <SelectItem value="New Roof Installation">New Roof Installation</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="message" className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Message</Label>
          <Textarea id="message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required rows={4} className="mt-1 border-slate-300 resize-none" />
        </div>
        <Button type="submit" disabled={loading} className="w-full bg-red-600 text-white hover:bg-red-700 py-3">
          {loading ? 'Submitting...' : 'Request Free Quote'}
        </Button>
      </form>
    </div>
  );
}
