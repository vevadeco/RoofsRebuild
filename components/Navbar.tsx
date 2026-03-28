'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '@/lib/useAuth';

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
    router.refresh();
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Home className="text-red-600 h-6 w-6" />
            <span className="text-xl font-bold text-slate-900 tracking-tight">Roofs Canada</span>
          </Link>
          <div className="flex items-center gap-6">
            {user?.role === 'admin' && (
              <>
                <Link href="/admin/dashboard" className="text-slate-700 hover:text-red-600 transition-colors">
                  Dashboard
                </Link>
                <Link href="/admin/settings" className="text-slate-700 hover:text-red-600 transition-colors flex items-center gap-1">
                  <Settings className="h-4 w-4" /> Settings
                </Link>
                <Button onClick={handleLogout} variant="outline" className="border-slate-200 hover:border-slate-300 hover:bg-slate-50">
                  Logout
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
