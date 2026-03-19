'use client';

/**
 * CompanyModal — Slide-in modal displaying a company's profile.
 * Opens on card click. Updates URL to ?company=slug without full navigation.
 * Uses the same profile component as the full page (isModal=true).
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { BrandUpProfile } from '@/components/profiles/BrandUpProfile';
import { TraceUpProfile } from '@/components/profiles/TraceUpProfile';
import { LinkUpProfile }   from '@/components/profiles/LinkUpProfile';
import { useClickOutside } from '@/hooks/useClickOutside';
import type { ProfileType, PublicProfileResponse } from '@/types';

interface CompanyModalProps {
  slug:        string | null;
  profileType: ProfileType;
  onClose:     () => void;
}

export function CompanyModal({ slug, profileType, onClose }: CompanyModalProps) {
  const router   = useRouter();
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);

  const [data, setData]       = useState<PublicProfileResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const close = useCallback(() => {
    // Remove company param from URL
    router.replace(pathname, { scroll: false });
    onClose();
  }, [router, pathname, onClose]);

  useClickOutside(panelRef, close);

  // Fetch profile data when slug changes
  useEffect(() => {
    if (!slug) { setData(null); return; }

    setLoading(true);
    setError(null);

    fetch(`/api/companies/${slug}?type=${profileType}`)
      .then((r) => {
        if (!r.ok) throw new Error('Not found');
        return r.json() as Promise<PublicProfileResponse>;
      })
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => { setError('Impossible de charger le profil.'); setLoading(false); });
  }, [slug, profileType]);

  // Update URL with company slug
  useEffect(() => {
    if (!slug) return;
    const url = new URL(window.location.href);
    url.searchParams.set('company', slug);
    router.replace(url.pathname + url.search, { scroll: false });
  }, [slug, router]);

  // Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [close]);

  if (!slug) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
        aria-hidden="true"
        style={{ transition: 'opacity 0.2s' }}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Profil entreprise"
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[680px] overflow-y-auto"
        style={{
          background:  '#FFFFFF',
          boxShadow:   '-8px 0 32px rgba(0,0,0,0.16)',
          animation:   'slideInRight 0.2s ease-out',
        }}
      >
        {/* Close button */}
        <button
          onClick={close}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded hover:bg-[#F5F5F5] transition-colors"
          aria-label="Fermer"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#616161" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>

        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-[#0078D4] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <p className="text-[#D13438] text-sm">{error}</p>
            <button onClick={close} className="ms-btn-secondary text-sm">Fermer</button>
          </div>
        )}

        {!loading && !error && data && (
          <>
            {profileType === 'brandup' && (
              <BrandUpProfile
                company={data.company}
                profile={data.profile as Parameters<typeof BrandUpProfile>[0]['profile']}
                rse={data.rse}
                isModal
              />
            )}
            {profileType === 'traceup' && (
              <TraceUpProfile
                company={data.company}
                profile={data.profile as Parameters<typeof TraceUpProfile>[0]['profile']}
                rse={data.rse}
                isModal
              />
            )}
            {profileType === 'linkup' && (
              <LinkUpProfile
                company={data.company}
                profile={data.profile as Parameters<typeof LinkUpProfile>[0]['profile']}
                rse={data.rse}
                isModal
              />
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to   { transform: translateX(0);    }
        }
      `}</style>
    </>
  );
}
