'use client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';

type Settings = {
  resend_api_key: string;
  resend_api_key_set: boolean;
  sender_email: string;
  notification_email: string;
};

export default function AdminSettings() {
  const [settings, setSettings] = useState<Settings>({
    resend_api_key: '',
    resend_api_key_set: false,
    sender_email: '',
    notification_email: '',
  });
  const [newApiKey, setNewApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => setSettings(data))
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body: Record<string, string> = {
        sender_email: settings.sender_email,
        notification_email: settings.notification_email,
      };
      if (newApiKey.trim()) body.resend_api_key = newApiKey.trim();

      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();

      if (newApiKey.trim()) {
        setSettings((s) => ({ ...s, resend_api_key_set: true, resend_api_key: '••••••••' }));
        setNewApiKey('');
      }
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
          <p className="text-slate-600">Configure email notifications and integrations.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Resend */}
          <div className="bg-white border border-slate-200 rounded-md shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-slate-800">Resend Email</h2>
              {settings.resend_api_key_set ? (
                <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                  <CheckCircle2 className="h-4 w-4" /> Connected
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-sm text-amber-600 font-medium">
                  <AlertCircle className="h-4 w-4" /> Not configured
                </span>
              )}
            </div>

            <div>
              <Label htmlFor="api-key" className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                {settings.resend_api_key_set ? 'Replace API Key' : 'API Key'}
              </Label>
              <div className="relative mt-1">
                <Input
                  id="api-key"
                  type={showKey ? 'text' : 'password'}
                  value={newApiKey}
                  onChange={(e) => setNewApiKey(e.target.value)}
                  placeholder={settings.resend_api_key_set ? 'Enter new key to replace existing' : 're_xxxxxxxxxxxx'}
                  className="border-slate-300 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Get your API key from{' '}
                <a href="https://resend.com/api-keys" target="_blank" rel="noreferrer" className="text-red-600 hover:underline">
                  resend.com/api-keys
                </a>
              </p>
            </div>

            <div>
              <Label htmlFor="sender-email" className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                Sender Email
              </Label>
              <Input
                id="sender-email"
                type="email"
                value={settings.sender_email}
                onChange={(e) => setSettings((s) => ({ ...s, sender_email: e.target.value }))}
                placeholder="noreply@yourdomain.com"
                className="mt-1 border-slate-300"
              />
              <p className="text-xs text-slate-500 mt-1">Must be a verified domain in Resend.</p>
            </div>

            <div>
              <Label htmlFor="notification-email" className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                Notification Email
              </Label>
              <Input
                id="notification-email"
                type="email"
                value={settings.notification_email}
                onChange={(e) => setSettings((s) => ({ ...s, notification_email: e.target.value }))}
                placeholder="you@yourdomain.com"
                className="mt-1 border-slate-300"
              />
              <p className="text-xs text-slate-500 mt-1">Where new lead notifications are sent.</p>
            </div>

            {settings.resend_api_key_set && (
              <div className="pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTestEmail}
                  disabled={testing}
                  className="border-slate-300 text-slate-700"
                >
                  {testing ? 'Sending...' : 'Send Test Email'}
                </Button>
              </div>
            )}
          </div>

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
