'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';
import { useAuth } from '@/lib/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    if (result.success) {
      toast.success('Login successful!');
      router.push('/admin/dashboard');
      router.refresh();
    } else {
      toast.error(result.error ?? 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Image src="/logo.svg" alt="Roofs Canada" width={36} height={36} className="h-9 w-9" />
            <span className="text-2xl font-bold text-slate-900 tracking-tight">Roofs Canada</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 mb-2">Admin Login</h1>
          <p className="text-base text-slate-600">Sign in to manage leads</p>
        </div>

        <div className="bg-white border border-slate-200 p-8 rounded-md shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 border-slate-300" />
            </div>
            <div>
              <Label htmlFor="password" className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 border-slate-300" />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-red-600 text-white hover:bg-red-700 py-3">
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-slate-600 hover:text-red-600 transition-colors">
            ← Back to website
          </Link>
        </div>
      </div>
    </div>
  );
}
