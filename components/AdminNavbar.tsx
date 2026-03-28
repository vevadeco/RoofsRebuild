'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, Settings, LayoutDashboard } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '@/lib/useAuth';

export function AdminNavbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
    router.refresh();
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Home className="text-red-600 h-5 w-5" />
            <span className="text-lg font-bold text-slate-900 tracking-tight">Roofs Canada</span>
            <span className="ml-2 text-xs font-semibold uppercase tracking-widest text-slate-400 border border-slate-200 rounded px-2 py-0.5">Admin</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/admin/dashboard" className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-red-600 transition-colors">
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </Link>
            <Link href="/admin/settings" className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-red-600 transition-colors">
              <Settings className="h-4 w-4" /> Settings
            </Link>
            <Button onClick={handleLogout} variant="outline" size="sm" className="border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-sm">
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
