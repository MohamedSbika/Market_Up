'use client';

import { useState, useEffect } from 'react';
import { BoostModal } from '@/components/dashboard/BoostModal';
import { formatDateFR } from '@/lib/utils';

interface ActiveBoost {
  _id:         string;
  profileType: string;
  endDate:     string;
  amountHT:    number;
  amountTTC:   number;
}

interface BoostHistoryItem {
  _id:         string;
  profileType: string;
  startDate:   string;
  endDate:     string;
  durationDays:number;
  amountTTC:   number;
  status:      string;
}

const PROFILE_LABELS: Record<string, string> = {
  brandup: 'BrandUP',
  traceup: 'TraceUP',
  linkup:  'LinkUP',
};

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  active:  { label: 'Actif',    color: '#107C10', bg: '#DFF6DD' },
  expired: { label: 'Expiré',   color: '#616161', bg: '#F5F5F5' },
  pending: { label: 'En attente', color: '#8A6C00', bg: '#FFF4CE' },
};

export default function BoostPage() {
  const [activeBoost,  setActiveBoost]  = useState<ActiveBoost | null>(null);
  const [history,      setHistory]      = useState<BoostHistoryItem[]>([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [showModal,    setShowModal]    = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res  = await fetch('/api/dashboard/boost');
      const json = await res.json();
      if (res.ok) {
        setActiveBoost(json.activeBoost ?? null);
        setHistory(json.history ?? []);
      }
    } catch {
      setError('Erreur de chargement.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="max-w-[700px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#242424]" style={{ letterSpacing: '-0.02em' }}>
            Booster un profil
          </h1>
          <p className="text-sm text-[#616161] mt-1">
            Apparaissez en tête des résultats de recherche.
          </p>
        </div>
        {!activeBoost && (
          <button
            onClick={() => setShowModal(true)}
            className="ms-btn-primary"
            style={{ padding: '10px 20px', background: '#CA5010', borderColor: '#CA5010' }}
          >
            ⚡ Booster maintenant
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 rounded text-sm" style={{ background: '#FFF5F5', color: '#D13438', border: '1px solid #FCA5A5' }}>
          {error}
        </div>
      )}

      {/* Active boost banner */}
      {activeBoost && (
        <div
          className="ms-card p-5 flex items-center gap-4"
          style={{ borderLeft: '4px solid #CA5010', background: '#FFF4E5' }}
        >
          <span className="text-3xl">⚡</span>
          <div className="flex-1">
            <p className="font-semibold text-[#242424]">
              {PROFILE_LABELS[activeBoost.profileType]} est actuellement boosté
            </p>
            <p className="text-sm text-[#616161] mt-0.5">
              Expire le {formatDateFR(new Date(activeBoost.endDate))}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-[#CA5010]">{activeBoost.amountTTC.toFixed(2)} DT</p>
            <p className="text-xs text-[#616161]">TTC</p>
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="ms-card p-6">
        <h2 className="text-sm font-semibold text-[#242424] mb-4">Comment fonctionne le boost ?</h2>
        <div className="space-y-3">
          {[
            { icon: '🚀', text: 'Votre profil apparaît en premier dans les résultats de recherche.' },
            { icon: '📌', text: 'Badge "Boosté" visible sur votre carte dans les listes.' },
            { icon: '⏱️', text: 'Choisissez la durée : 7, 14, 30 jours ou plus.' },
            { icon: '💰', text: 'Tarif : 5 DT HT / jour. TVA 19% applicable.' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-xl">{item.icon}</span>
              <p className="text-sm text-[#424242]">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* History */}
      <div className="ms-card p-6">
        <h2 className="text-sm font-semibold text-[#242424] mb-4">Historique des boosts</h2>
        {isLoading ? (
          <div className="space-y-2 animate-pulse">
            {[1,2,3].map((i) => <div key={i} className="h-10 bg-[#E0E0E0] rounded" />)}
          </div>
        ) : history.length === 0 ? (
          <p className="text-sm text-[#616161]">Aucun boost pour l&apos;instant.</p>
        ) : (
          <div className="divide-y divide-[#E0E0E0]">
            {history.map((item) => {
              const st = STATUS_LABELS[item.status] ?? STATUS_LABELS.expired;
              return (
                <div key={item._id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#242424]">
                      {PROFILE_LABELS[item.profileType]} — {item.durationDays} jours
                    </p>
                    <p className="text-xs text-[#616161]">
                      {formatDateFR(new Date(item.startDate))} → {formatDateFR(new Date(item.endDate))}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className="px-2 py-0.5 rounded text-xs font-medium"
                      style={{ background: st.bg, color: st.color }}
                    >
                      {st.label}
                    </span>
                    <span className="text-sm font-semibold text-[#242424]">
                      {item.amountTTC.toFixed(2)} DT
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <BoostModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); fetchData(); }}
        />
      )}
    </div>
  );
}
