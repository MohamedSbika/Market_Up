'use client';

/**
 * BoostModal — Shared modal for purchasing a boost.
 * Used from: dashboard overview, /dashboard/boost, individual profile pages.
 * Handles: profile type selection, duration picker, price calculation, payment initiation.
 */
import { useState } from 'react';
import { computeTTC } from '@/lib/utils';
import type { ProfileType } from '@/types';

interface BoostModalProps {
  isOpen:          boolean;
  onClose:         () => void;
  defaultProfile?: ProfileType;
  onSuccess?:      (paymentUrl: string) => void;
}

const PRICE_PER_DAY = 5; // DT HT

const PROFILES = [
  { type: 'brandup' as ProfileType, label: 'BrandUP', color: '#0078D4' },
  { type: 'traceup' as ProfileType, label: 'TraceUP', color: '#8764B8' },
  { type: 'linkup'  as ProfileType, label: 'LinkUP',  color: '#C5A059' },
];

const DURATIONS = [
  { days: 7,   label: '7 jours'  },
  { days: 14,  label: '14 jours' },
  { days: 30,  label: '1 mois'   },
  { days: 90,  label: '3 mois'   },
];

export function BoostModal({ isOpen, onClose, defaultProfile = 'brandup', onSuccess }: BoostModalProps) {
  const [selectedProfile, setSelectedProfile] = useState<ProfileType>(defaultProfile);
  const [selectedDays,    setSelectedDays]    = useState(30);
  const [isLoading,       setIsLoading]       = useState(false);
  const [error,           setError]           = useState<string | null>(null);

  if (!isOpen) return null;

  const amountHT  = PRICE_PER_DAY * selectedDays;
  const amountTTC = computeTTC(amountHT);
  const tva       = amountTTC - amountHT;

  const handlePurchase = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/dashboard/boost', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ profileType: selectedProfile, durationDays: selectedDays }),
      });

      const data = await res.json() as { paymentUrl?: string; error?: string };

      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Une erreur est survenue.');
        return;
      }

      if (data.paymentUrl) {
        onSuccess?.(data.paymentUrl);
        window.location.href = data.paymentUrl;
      }
    } catch {
      setError('Impossible de contacter le serveur. Réessayez.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose} aria-hidden="true" />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="boost-modal-title"
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div
          className="w-full max-w-md rounded-xl overflow-hidden"
          style={{ background: '#FFFFFF', boxShadow: '0 8px 32px rgba(0,0,0,0.16)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#E0E0E0' }}>
            <div className="flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#C2410C">
                <path d="M13 2L4.09 12.97H11L10 22L20.91 11.03H14L13 2Z"/>
              </svg>
              <h2 id="boost-modal-title" className="font-semibold text-[15px] text-[#242424]">
                Activer un Boost
              </h2>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#F5F5F5]" aria-label="Fermer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#616161" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Profile selector */}
            <div>
              <label className="ms-label mb-2">Profil à booster</label>
              <div className="grid grid-cols-3 gap-2">
                {PROFILES.map((p) => (
                  <button
                    key={p.type}
                    onClick={() => setSelectedProfile(p.type)}
                    className="py-2 rounded text-sm font-medium transition-all"
                    style={
                      selectedProfile === p.type
                        ? { background: p.color, color: '#FFFFFF', border: `2px solid ${p.color}` }
                        : { background: '#F5F5F5', color: '#616161', border: '2px solid transparent' }
                    }
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration selector */}
            <div>
              <label className="ms-label mb-2">Durée</label>
              <div className="grid grid-cols-2 gap-2">
                {DURATIONS.map((d) => (
                  <button
                    key={d.days}
                    onClick={() => setSelectedDays(d.days)}
                    className="py-2.5 rounded text-sm font-medium transition-all"
                    style={
                      selectedDays === d.days
                        ? { background: '#0078D4', color: '#FFFFFF', border: '2px solid #0078D4' }
                        : { background: '#F5F5F5', color: '#616161', border: '2px solid transparent' }
                    }
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price breakdown */}
            <div className="rounded-lg p-4 space-y-1.5" style={{ background: '#F5F5F5' }}>
              <div className="flex justify-between text-sm">
                <span className="text-[#616161]">Montant HT</span>
                <span className="text-[#242424]">{amountHT.toFixed(2)} DT</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#616161]">TVA (19%)</span>
                <span className="text-[#242424]">{tva.toFixed(2)} DT</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t pt-1.5 mt-1" style={{ borderColor: '#E0E0E0' }}>
                <span className="text-[#242424]">Total TTC</span>
                <span style={{ color: '#0078D4' }}>{amountTTC.toFixed(2)} DT</span>
              </div>
            </div>

            {error && (
              <p className="text-sm text-[#D13438] bg-[#FFF5F5] px-3 py-2 rounded" style={{ border: '1px solid #FCA5A5' }}>
                {error}
              </p>
            )}

            {/* CTA */}
            <button
              onClick={handlePurchase}
              disabled={isLoading}
              className="w-full py-3 rounded font-semibold text-sm text-white transition-colors disabled:opacity-60"
              style={{ background: '#0078D4' }}
              onMouseEnter={(e) => { if (!isLoading) (e.currentTarget as HTMLElement).style.background = '#106EBE'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#0078D4'; }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Traitement…
                </span>
              ) : (
                `Payer ${amountTTC.toFixed(2)} DT TTC`
              )}
            </button>

            <p className="text-[11px] text-[#616161] text-center">
              Paiement sécurisé via Konnect TN / ClicToPay
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
