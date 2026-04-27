'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Settings, LayoutDashboard, Menu, X, LogOut, FileText, Receipt } from 'lucide-react';
import { useAuth } from '@/lib/useAuth';

export function AdminNavbar() {
  const { logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [logoText, setLogoText] = useState('Roofs Canada');
  const [companyName, setCompanyName] = useState('Roofs Canada');

  useEffect(() => {
    fetch('/api/public/branding')
      .then(r => r.json())
      .then(d => {
        if (d.logo_url) setLogoUrl(d.logo_url);
        if (d.logo_text) setLogoText(d.logo_text);
        if (d.company_name) {
          setCompanyName(d.company_name);
          if (!d.logo_text) setLogoText(d.company_name);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/');
    router.refresh();
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-24">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img src={logoUrl || '/logo.svg'} alt={companyName} className="h-8 object-contain" />
            <span className="text-base md:text-lg font-bold text-slate-900 tracking-tight">{logoText}</span>
            <span className="ml-1 text-xs font-semibold uppercase tracking-widest text-slate-400 border border-slate-200 rounded px-1.5 py-0.5 hidden sm:inline">Admin</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/admin/dashboard" className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-red-600 transition-colors">
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </Link>
            <Link href="/admin/estimates" className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-red-600 transition-colors">
              <FileText className="h-4 w-4" /> Estimates
            </Link>
            <Link href="/admin/invoices" className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-red-600 transition-colors">
              <Receipt className="h-4 w-4" /> Invoices
            </Link>
            <Link href="/admin/settings" className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-red-600 transition-colors">
              <Settings className="h-4 w-4" /> Settings
            </Link>
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-red-600 transition-colors border border-slate-200 rounded-md px-3 py-1.5 hover:border-slate-300">
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-slate-600 hover:text-red-600 transition-colors p-1"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 flex flex-col gap-1">
          <Link href="/admin/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-2 text-sm text-slate-700 hover:text-red-600 px-3 py-2.5 rounded-md hover:bg-slate-50 transition-colors">
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </Link>
          <Link href="/admin/estimates" onClick={() => setOpen(false)} className="flex items-center gap-2 text-sm text-slate-700 hover:text-red-600 px-3 py-2.5 rounded-md hover:bg-slate-50 transition-colors">
            <FileText className="h-4 w-4" /> Estimates
          </Link>
          <Link href="/admin/invoices" onClick={() => setOpen(false)} className="flex items-center gap-2 text-sm text-slate-700 hover:text-red-600 px-3 py-2.5 rounded-md hover:bg-slate-50 transition-colors">
            <Receipt className="h-4 w-4" /> Invoices
          </Link>
          <Link href="/admin/settings" onClick={() => setOpen(false)} className="flex items-center gap-2 text-sm text-slate-700 hover:text-red-600 px-3 py-2.5 rounded-md hover:bg-slate-50 transition-colors">
            <Settings className="h-4 w-4" /> Settings
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-slate-700 hover:text-red-600 px-3 py-2.5 rounded-md hover:bg-slate-50 transition-colors w-full text-left">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      )}
    </nav>
  );
}
