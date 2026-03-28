'use client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';

type Settings = {
  // Email
  resend_api_key_set: boolean;
  sender_email: string;
  notification_email: string;
  // SEO
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  seo_og_image: string;
  // Analytics
  gtag_id: string;
  // Facebook
  fb_pixel_id: string;
  fb_access_token_set: boolean;
  fb_dataset_id: string;
};

const defaultSettings: Settings = {
  resend_api_key_set: false,
  sender_email: '',
  notification_email: '',
  seo_title: '',
  seo_description: '',
  seo_keywords: '',
  seo_og_image: '',
  gtag_id: '',
  fb_pixel_id: '',
  fb_access_token_set: false,
  fb_dataset_id: '',
};

function SectionCard({ title, status, children }: {
  title: string;
  status?: { set: boolean; label: [string, string] };
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-md shadow-sm p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-slate-800">{title}</h2>
        {status && (
          status.set ? (
            <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
              <CheckCircle2 className="h-4 w-4" /> {status.label[0]}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-sm text-amber-600 font-medium">
              <AlertCircle className="h-4 w-4" /> {status.label[1]}
            </span>
          )
        )}
      </div>
      {children}
    </div>
  );
}

function Field({ id, label, hint, children }: { id: string; label: string; hint?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <Label htmlFor={id} className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{label}</Label>
      <div className="mt-1">{children}</div>
      {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
    </div>
  );
}

export default function AdminSettings() {
  const [s, setS] = useState<Settings>(defaultSettings);
  const [newResendKey, setNewResendKey] = useState('');
  const [newFbToken, setNewFbToken] = useState('');
  const [showResend, setShowResend] = useState(false);
  const [showFbToken, setShowFbToken] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => setS((prev) => ({ ...prev, ...data })))
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const set = (key: keyof Settings) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setS((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body: Record<string, string> = {
        sender_email: s.sender_email,
        notification_email: s.notification_email,
        seo_title: s.seo_title,
        seo_description: s.seo_description,
        seo_keywords: s.seo_keywords,
        seo_og_image: s.seo_og_image,
        gtag_id: s.gtag_id,
        fb_pixel_id: s.fb_pixel_id,
        fb_dataset_id: s.fb_dataset_id,
      };
      if (newResendKey.trim()) body.resend_api_key = newResendKey.trim();
      if (newFbToken.trim()) body.fb_access_token = newFbToken.trim();

      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();

      if (newResendKey.trim()) { setS((p) => ({ ...p, resend_api_key_set: true })); setNewResendKey(''); }
      if (newFbToken.trim()) { setS((p) => ({ ...p, fb_access_token_set: true })); setNewFbToken(''); }
      toast.success('Settings saved');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    setTesting(true);
    try {
      const res = await fetch('/api/settings/test-email', { method: 'POST' });
      const data = await res.json();
      if (res.ok) toast.success('Test email sent — check your inbox');
      else toast.error(data.detail ?? 'Test failed');
    } catch {
      toast.error('Test email failed');
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 mb-2">Settings</h1>
          <p className="text-slate-600">Manage integrations, SEO, and analytics.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">

          {/* ── SEO ── */}
          <SectionCard title="SEO">
            <Field id="seo_title" label="Page Title" hint="Shown in browser tab and Google results. ~60 chars.">
              <Input id="seo_title" value={s.seo_title} onChange={set('seo_title')} placeholder="Roofs Canada — Trusted Roofing Experts" className="border-slate-300" />
            </Field>
            <Field id="seo_description" label="Meta Description" hint="Shown in Google search snippets. ~155 chars.">
              <Textarea id="seo_description" value={s.seo_description} onChange={set('seo_description')} placeholder="Professional roofing services across Canada..." rows={3} className="border-slate-300 resize-none" />
            </Field>
            <Field id="seo_keywords" label="Keywords" hint="Comma-separated. Optional — Google largely ignores this but useful for reference.">
              <Input id="seo_keywords" value={s.seo_keywords} onChange={set('seo_keywords')} placeholder="roofing, roof repair, shingle replacement, Canada" className="border-slate-300" />
            </Field>
            <Field id="seo_og_image" label="Social Share Image URL" hint="Shown when shared on Facebook, Twitter, etc. Use an absolute URL.">
              <Input id="seo_og_image" value={s.seo_og_image} onChange={set('seo_og_image')} placeholder="https://yourdomain.com/og-image.jpg" className="border-slate-300" />
            </Field>
          </SectionCard>

          {/* ── Google Analytics ── */}
          <SectionCard
            title="Google Analytics"
            status={{ set: !!s.gtag_id, label: ['Connected', 'Not configured'] }}
          >
            <Field id="gtag_id" label="Measurement ID" hint={<>Find this in Google Analytics → Admin → Data Streams. Starts with <code className="bg-slate-100 px-1 rounded">G-</code></>}>
              <Input id="gtag_id" value={s.gtag_id} onChange={set('gtag_id')} placeholder="G-XXXXXXXXXX" className="border-slate-300" />
            </Field>
          </SectionCard>

          {/* ── Facebook ── */}
          <SectionCard
            title="Facebook"
            status={{ set: !!s.fb_pixel_id, label: ['Pixel connected', 'Not configured'] }}
          >
            <Field id="fb_pixel_id" label="Pixel ID" hint="Found in Facebook Events Manager. Fires PageView and Lead events automatically.">
              <Input id="fb_pixel_id" value={s.fb_pixel_id} onChange={set('fb_pixel_id')} placeholder="123456789012345" className="border-slate-300" />
            </Field>
            <Field id="fb_access_token" label={s.fb_access_token_set ? 'Replace Conversions API Token' : 'Conversions API Token'} hint={<>Optional — enables server-side lead events via Facebook CAPI. <a href="https://developers.facebook.com/docs/marketing-api/conversions-api/get-started" target="_blank" rel="noreferrer" className="text-red-600 hover:underline">Learn more</a></>}>
              <div className="relative">
                <Input
                  id="fb_access_token"
                  type={showFbToken ? 'text' : 'password'}
                  value={newFbToken}
                  onChange={(e) => setNewFbToken(e.target.value)}
                  placeholder={s.fb_access_token_set ? 'Enter new token to replace' : 'EAAxxxxxxx...'}
                  className="border-slate-300 pr-10"
                />
                <button type="button" onClick={() => setShowFbToken((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showFbToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>
            <Field id="fb_dataset_id" label="Dataset ID" hint="Required for Conversions API. Usually the same as your Pixel ID.">
              <Input id="fb_dataset_id" value={s.fb_dataset_id} onChange={set('fb_dataset_id')} placeholder="123456789012345" className="border-slate-300" />
            </Field>
          </SectionCard>

          {/* ── Resend Email ── */}
          <SectionCard
            title="Email Notifications (Resend)"
            status={{ set: s.resend_api_key_set, label: ['Connected', 'Not configured'] }}
          >
            <Field id="resend_api_key" label={s.resend_api_key_set ? 'Replace API Key' : 'API Key'} hint={<>Get your key from <a href="https://resend.com/api-keys" target="_blank" rel="noreferrer" className="text-red-600 hover:underline">resend.com/api-keys</a></>}>
              <div className="relative">
                <Input
                  id="resend_api_key"
                  type={showResend ? 'text' : 'password'}
                  value={newResendKey}
                  onChange={(e) => setNewResendKey(e.target.value)}
                  placeholder={s.resend_api_key_set ? 'Enter new key to replace existing' : 're_xxxxxxxxxxxx'}
                  className="border-slate-300 pr-10"
                />
                <button type="button" onClick={() => setShowResend((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showResend ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>
            <Field id="sender_email" label="Sender Email" hint="Must be a verified domain in Resend.">
              <Input id="sender_email" type="email" value={s.sender_email} onChange={set('sender_email')} placeholder="noreply@yourdomain.com" className="border-slate-300" />
            </Field>
            <Field id="notification_email" label="Notification Email" hint="Where new lead alerts are sent.">
              <Input id="notification_email" type="email" value={s.notification_email} onChange={set('notification_email')} placeholder="you@yourdomain.com" className="border-slate-300" />
            </Field>
            {s.resend_api_key_set && (
              <Button type="button" variant="outline" onClick={handleTestEmail} disabled={testing} className="border-slate-300 text-slate-700">
                {testing ? 'Sending...' : 'Send Test Email'}
              </Button>
            )}
          </SectionCard>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving} className="bg-red-600 text-white hover:bg-red-700 px-8">
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
