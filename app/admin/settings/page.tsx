'use client';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Eye, EyeOff, CheckCircle2, AlertCircle, Upload } from 'lucide-react';

type Settings = {
  resend_api_key_set: boolean;
  sender_email: string;
  notification_email: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  seo_og_image: string;
  gtag_id: string;
  fb_pixel_id: string;
  fb_access_token_set: boolean;
  fb_dataset_id: string;
  stripe_secret_key_set: boolean;
  stripe_publishable_key: string;
  stripe_webhook_secret_set: boolean;
  logo_url: string;
  logo_text: string;
  company_name: string;
  company_address: string;
  company_phone: string;
  company_email: string;
  terms_and_conditions: string;
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
  stripe_secret_key_set: false,
  stripe_publishable_key: '',
  stripe_webhook_secret_set: false,
  logo_url: '',
  logo_text: '',
  company_name: '',
  company_address: '',
  company_phone: '',
  company_email: '',
  terms_and_conditions: '',
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
  const [newStripeSecret, setNewStripeSecret] = useState('');
  const [newStripeWebhook, setNewStripeWebhook] = useState('');
  const [showResend, setShowResend] = useState(false);
  const [showFbToken, setShowFbToken] = useState(false);
  const [showStripeSecret, setShowStripeSecret] = useState(false);
  const [showStripeWebhook, setShowStripeWebhook] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => setS((prev) => ({ ...prev, ...data })))
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const set = (key: keyof Settings) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setS((prev) => ({ ...prev, [key]: e.target.value }));

  const handleLogoUpload = async (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File must be under 2MB');
      return;
    }
    setUploadingLogo(true);
    try {
      const fd = new FormData();
      fd.append('logo', file);
      const res = await fetch('/api/settings/logo', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? 'Upload failed');
      setS(prev => ({ ...prev, logo_url: data.logo_url }));
      toast.success('Logo uploaded');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploadingLogo(false);
    }
  };

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
        company_name: s.company_name,
        logo_text: s.logo_text,
        company_address: s.company_address,
        company_phone: s.company_phone,
        company_email: s.company_email,
        terms_and_conditions: s.terms_and_conditions,
      };
      if (newResendKey.trim()) body.resend_api_key = newResendKey.trim();
      if (newFbToken.trim()) body.fb_access_token = newFbToken.trim();
      if (newStripeSecret.trim()) body.stripe_secret_key = newStripeSecret.trim();
      if (newStripeWebhook.trim()) body.stripe_webhook_secret = newStripeWebhook.trim();
      if (s.stripe_publishable_key.trim()) body.stripe_publishable_key = s.stripe_publishable_key.trim();

      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();

      if (newResendKey.trim()) { setS((p) => ({ ...p, resend_api_key_set: true })); setNewResendKey(''); }
      if (newFbToken.trim()) { setS((p) => ({ ...p, fb_access_token_set: true })); setNewFbToken(''); }
      if (newStripeSecret.trim()) { setS((p) => ({ ...p, stripe_secret_key_set: true })); setNewStripeSecret(''); }
      if (newStripeWebhook.trim()) { setS((p) => ({ ...p, stripe_webhook_secret_set: true })); setNewStripeWebhook(''); }
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
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 mb-2">Settings</h1>
          <p className="text-slate-600">Manage branding, integrations, SEO, and analytics.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">

          {/* ── Branding ── */}
          <SectionCard title="Branding">
            <Field id="logo_upload" label="Logo" hint="PNG, JPG, SVG, or WebP. Max 2MB.">
              <div className="space-y-3">
                {s.logo_url && (
                  <img src={s.logo_url} alt="Current logo" style={{ maxHeight: 60 }} className="object-contain border border-slate-200 rounded p-2 bg-white" />
                )}
                <div className="flex items-center gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) handleLogoUpload(file);
                      e.target.value = '';
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={uploadingLogo}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-slate-300 text-slate-700 gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {uploadingLogo ? 'Uploading...' : s.logo_url ? 'Replace Logo' : 'Upload Logo'}
                  </Button>
                </div>
              </div>
            </Field>
            <Field id="logo_text" label="Logo Text" hint="Text displayed next to the logo. Defaults to company name if empty.">
              <Input id="logo_text" value={s.logo_text} onChange={set('logo_text')} placeholder="Roofs Canada" className="border-slate-300" />
            </Field>
            <Field id="company_name" label="Company Name">
              <Input id="company_name" value={s.company_name} onChange={set('company_name')} placeholder="Roofs Canada" className="border-slate-300" />
            </Field>
            <Field id="company_address" label="Company Address" hint="Shown on PDF estimates and invoices.">
              <Input id="company_address" value={s.company_address} onChange={set('company_address')} placeholder="123 Main St, Toronto, ON M1A 1A1" className="border-slate-300" />
            </Field>
            <Field id="company_phone" label="Company Phone">
              <Input id="company_phone" value={s.company_phone} onChange={set('company_phone')} placeholder="(416) 555-0100" className="border-slate-300" />
            </Field>
            <Field id="company_email" label="Company Email">
              <Input id="company_email" type="email" value={s.company_email} onChange={set('company_email')} placeholder="info@roofscanada.ca" className="border-slate-300" />
            </Field>
          </SectionCard>

          {/* ── Terms & Conditions ── */}
          <SectionCard title="Terms & Conditions">
            <Field id="terms_and_conditions" label="Terms & Conditions" hint="Appended to all estimate and invoice PDFs.">
              <Textarea
                id="terms_and_conditions"
                value={s.terms_and_conditions}
                onChange={set('terms_and_conditions')}
                rows={6}
                placeholder="Enter your terms and conditions here..."
                className="border-slate-300 resize-none"
              />
            </Field>
          </SectionCard>

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

          {/* ── Stripe ── */}
          <SectionCard
            title="Stripe Payments"
            status={{ set: s.stripe_secret_key_set, label: ['Connected', 'Not configured'] }}
          >
            <Field id="stripe_secret" label={s.stripe_secret_key_set ? 'Replace Secret Key' : 'Secret Key'} hint={<>Starts with <code className="bg-slate-100 px-1 rounded">sk_live_</code> or <code className="bg-slate-100 px-1 rounded">sk_test_</code>. Found in your <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noreferrer" className="text-red-600 hover:underline">Stripe dashboard</a>.</>}>
              <div className="relative">
                <Input id="stripe_secret" type={showStripeSecret ? 'text' : 'password'} value={newStripeSecret} onChange={e => setNewStripeSecret(e.target.value)} placeholder={s.stripe_secret_key_set ? 'Enter new key to replace' : 'sk_live_...'} className="border-slate-300 pr-10" />
                <button type="button" onClick={() => setShowStripeSecret(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">{showStripeSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
              </div>
            </Field>
            <Field id="stripe_pk" label="Publishable Key" hint="Starts with pk_live_ or pk_test_. Safe to expose publicly.">
              <Input id="stripe_pk" value={s.stripe_publishable_key} onChange={set('stripe_publishable_key')} placeholder="pk_live_..." className="border-slate-300" />
            </Field>
            <Field id="stripe_webhook" label={s.stripe_webhook_secret_set ? 'Replace Webhook Secret' : 'Webhook Secret'} hint={<>Add a webhook endpoint pointing to <code className="bg-slate-100 px-1 rounded">/api/webhooks/stripe</code> in your Stripe dashboard. Listen for <code className="bg-slate-100 px-1 rounded">checkout.session.completed</code>.</>}>
              <div className="relative">
                <Input id="stripe_webhook" type={showStripeWebhook ? 'text' : 'password'} value={newStripeWebhook} onChange={e => setNewStripeWebhook(e.target.value)} placeholder={s.stripe_webhook_secret_set ? 'Enter new secret to replace' : 'whsec_...'} className="border-slate-300 pr-10" />
                <button type="button" onClick={() => setShowStripeWebhook(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">{showStripeWebhook ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
              </div>
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
