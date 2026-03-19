'use client';

/**
 * Navbar — Public site navigation.
 * Shows engine links, B2B/B2C filter pills, and auth CTAs.
 * Uses Fluent Design tokens.
 */
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const engines = [
  { name: 'BrandUP', href: '/brandup', color: '#0078D4' },
  { name: 'TraceUP', href: '/traceup', color: '#8764B8' },
  { name: 'LinkUP',  href: '/linkup',  color: '#000000' },
];

export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      className="sticky top-0 z-50 border-b"
      style={{ background: '#FFFFFF', borderColor: '#E0E0E0' }}
    >
      <div className="max-w-[1280px] mx-auto px-6 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-1 font-bold text-xl tracking-tight"
          style={{ letterSpacing: '-0.02em' }}
        >
          <span style={{ color: '#0078D4' }}>MARKET</span>
          <span style={{ color: '#242424' }}>UP</span>
        </Link>

        {/* Engine nav (desktop) */}
        <div className="hidden md:flex items-center gap-1">
          {engines.map((e) => {
            const active = pathname.startsWith(e.href);
            return (
              <Link
                key={e.href}
                href={e.href}
                className={cn(
                  'px-4 py-1.5 rounded text-sm font-medium transition-colors',
                  active ? 'text-white' : 'text-[#616161] hover:text-[#242424] hover:bg-[#F5F5F5]'
                )}
                style={active ? { backgroundColor: e.color } : {}}
              >
                {e.name}
              </Link>
            );
          })}
        </div>

        {/* Auth CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/signin"
            className="text-sm font-medium text-[#0078D4] hover:text-[#106EBE] transition-colors"
          >
            Connexion
          </Link>
          <Link
            href="/signup"
            className="ms-btn-primary text-sm"
            style={{ padding: '6px 16px' }}
          >
            Inscription
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded hover:bg-[#F5F5F5] transition-colors"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#242424" strokeWidth="2">
            {menuOpen
              ? <path d="M18 6L6 18M6 6l12 12"/>
              : <><line x1="3" y1="6"  x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
            }
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t px-6 py-4 flex flex-col gap-3" style={{ borderColor: '#E0E0E0' }}>
          {engines.map((e) => (
            <Link
              key={e.href}
              href={e.href}
              className="text-sm font-medium text-[#242424]"
              onClick={() => setMenuOpen(false)}
            >
              {e.name}
            </Link>
          ))}
          <hr style={{ borderColor: '#E0E0E0' }} />
          <Link href="/signin" className="text-sm text-[#0078D4]" onClick={() => setMenuOpen(false)}>Connexion</Link>
          <Link href="/signup" className="ms-btn-primary text-sm w-fit" onClick={() => setMenuOpen(false)}>Inscription</Link>
        </div>
      )}
    </nav>
  );
}
