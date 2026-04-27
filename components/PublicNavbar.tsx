'use client';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const links = [
  { label: 'Services', href: '#services' },
  { label: 'Reviews', href: '#reviews' },
  { label: 'Areas', href: '#areas' },
  { label: 'Get a Quote', href: '#hero', cta: true },
];

export function PublicNavbar() {
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

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#hero" className="flex items-center gap-2">
            <img src={logoUrl || '/logo.svg'} alt={companyName} className="h-8 w-8 object-contain" />
            <span className="text-xl font-bold text-slate-900 tracking-tight">{logoText}</span>
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((l) =>
              l.cta ? (
                <a
                  key={l.label}
                  href={l.href}
                  className="bg-red-600 text-white text-sm font-medium px-5 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                  {l.label}
                </a>
              ) : (
                <a
                  key={l.label}
                  href={l.href}
                  className="text-sm text-slate-700 hover:text-red-600 transition-colors font-medium"
                >
                  {l.label}
                </a>
              )
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-slate-700 hover:text-red-600 transition-colors"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-slate-100 bg-white px-6 py-4 flex flex-col gap-4">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className={
                l.cta
                  ? 'bg-red-600 text-white text-sm font-medium px-5 py-2.5 rounded-md text-center hover:bg-red-700 transition-colors'
                  : 'text-sm text-slate-700 hover:text-red-600 transition-colors font-medium py-1'
              }
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
