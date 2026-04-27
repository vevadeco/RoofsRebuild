'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CreditCard, Banknote, CheckCircle2, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type Invoice = {
  id: string; number: string; status: string; payment_method: string | null;
  subtotal: number; tax: number; transaction_fee: number; total: number;
  lead_name: string; lead_email: string;
  items: { description: string; qty: number; unit_price: number }[];
  notes: string; paid_at: string | null;
};

const TAX = 0.13;
const FEE = 0.03;

export default function InvoicePayPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const justPaid = searchParams.get('paid') === '1';

  const [inv, setInv] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState<'cash' | 'card' | null>(null);
  const [logoUrl, setLogoUrl] = useState('');
  const [companyName, setCompanyName] = useState('Roofs Canada');

  useEffect(() => {
    fetch(`/api/invoices/${params.id}`).then(r => r.json()).then(setInv)
      .catch(() => toast.error('Failed to load invoice'))
      .finally(() => setLoading(false));
  }, [params.id]);

  useEffect(() => {
    fetch('/api/public/branding')
      .then(r => r.json())
      .then(d => {
        if (d.logo_url) setLogoUrl(d.logo_url);
        if (d.company_name) setCompanyName(d.company_name);
      })
      .catch(() => {});
  }, []);

  const handlePay = async (method: 'cash' | 'card') => {
    setPaying(method);
    try {
      const res = await fetch(`/api/invoices/${params.id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_method: method }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);

      if (method === 'card' && data.url) {
        window.location.href = data.url;
      } else {
        setInv(prev => prev ? { ...prev, status: 'paid', payment_method: 'cash', total: data.total } : prev);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Payment failed');
      setPaying(null);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="h-8 w-8 animate-spin text-red-600" />
    </div>
  );

  if (!inv) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <p className="text-slate-500">Invoice not found.</p>
    </div>
  );

  const subtotal = Number(inv.subtotal);
  const cardTax = Math.round(subtotal * TAX * 100) / 100;
  const cardFee = Math.round(subtotal * FEE * 100) / 100;
  const cardTotal = Math.round((subtotal + cardTax + cardFee) * 100) / 100;

  const isPaid = inv.status === 'paid' || justPaid;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <Image src="/logo.svg" alt={companyName} width={32} height={32} className="h-8 w-8" />
          <span className="text-xl font-bold text-slate-900 tracking-tight">{companyName}</span>
        </div>

        {isPaid ? (
          <div className="bg-white border border-green-200 rounded-xl p-8 text-center shadow-sm">
            <CheckCircle2 className="h-14 w-14 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-semibold text-slate-900 mb-2">Payment Received</h1>
            <p className="text-slate-600">Thank you, {inv.lead_name}. Your invoice {inv.number} has been paid.</p>
            <p className="text-slate-400 text-sm mt-2">We'll be in touch shortly to confirm your appointment.</p>
          </div>
        ) : (
          <>
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-6">
              <div className="bg-red-600 px-6 py-5">
                <p className="text-red-200 text-xs uppercase tracking-widest font-semibold">Invoice</p>
                <h1 className="text-white text-2xl font-bold mt-1">{inv.number}</h1>
                <p className="text-red-200 text-sm mt-1">For {inv.lead_name}</p>
              </div>

              <table className="w-full text-sm">
                <thead className="border-b border-slate-100 bg-slate-50">
                  <tr className="text-xs uppercase tracking-wider text-slate-500">
                    <th className="px-5 py-3 text-left">Description</th>
                    <th className="px-3 py-3 text-center">Qty</th>
                    <th className="px-5 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {inv.items.map((item, i) => (
                    <tr key={i}>
                      <td className="px-5 py-3 text-slate-700">{item.description}</td>
                      <td className="px-3 py-3 text-center text-slate-500">{item.qty}</td>
                      <td className="px-5 py-3 text-right font-medium text-slate-800">${(item.qty * item.unit_price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {inv.notes && (
                <div className="px-5 py-3 border-t border-slate-100 bg-slate-50">
                  <p className="text-xs text-slate-500">{inv.notes}</p>
                </div>
              )}
            </div>

            {/* Payment options */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Cash */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Banknote className="h-5 w-5 text-slate-600" />
                  <h2 className="font-semibold text-slate-800">Pay by Cash</h2>
                </div>
                <div className="space-y-1 text-sm text-slate-600 mb-4">
                  <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between text-green-600 font-medium"><span>Tax</span><span>None</span></div>
                  <div className="flex justify-between font-bold text-slate-900 border-t border-slate-100 pt-2 mt-2"><span>Total</span><span>${subtotal.toFixed(2)}</span></div>
                </div>
                <Button
                  onClick={() => handlePay('cash')}
                  disabled={!!paying}
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white"
                >
                  {paying === 'cash' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Cash Payment'}
                </Button>
              </div>

              {/* Card */}
              <div className="bg-white border border-red-200 rounded-xl p-5 shadow-sm ring-1 ring-red-100">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="h-5 w-5 text-red-600" />
                  <h2 className="font-semibold text-slate-800">Pay by Card</h2>
                </div>
                <div className="space-y-1 text-sm text-slate-600 mb-4">
                  <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>HST (13%)</span><span>${cardTax.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Card Fee (3%)</span><span>${cardFee.toFixed(2)}</span></div>
                  <div className="flex justify-between font-bold text-slate-900 border-t border-slate-100 pt-2 mt-2"><span>Total</span><span>${cardTotal.toFixed(2)}</span></div>
                </div>
                <Button
                  onClick={() => handlePay('card')}
                  disabled={!!paying}
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                >
                  {paying === 'card' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Pay Online with Card'}
                </Button>
              </div>
            </div>

            <p className="text-center text-xs text-slate-400 mt-6">
              Secure payments powered by Stripe. Roofs Canada — Southern Ontario.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
