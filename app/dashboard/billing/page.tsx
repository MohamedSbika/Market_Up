'use client';

import { useState, useEffect, useCallback } from 'react';
import { BillingTable } from '@/components/dashboard/BillingTable';
import type { IBillingRecord } from '@/types';

export default function BillingPage() {
  const [records,   setRecords]   = useState<IBillingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [page,      setPage]      = useState(1);
  const [total,     setTotal]     = useState(0);

  const LIMIT = 10;

  const fetchRecords = useCallback(async (p: number) => {
    setIsLoading(true);
    try {
      const res  = await fetch(`/api/dashboard/billing?page=${p}&limit=${LIMIT}`);
      const json = await res.json();
      if (res.ok) {
        setRecords(json.records ?? []);
        setTotal(json.total    ?? 0);
      } else {
        setError('Erreur de chargement.');
      }
    } catch {
      setError('Erreur inattendue.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchRecords(page); }, [page, fetchRecords]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="max-w-[900px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#242424]" style={{ letterSpacing: '-0.02em' }}>
          Facturation
        </h1>
        <p className="text-sm text-[#616161] mt-1">
          Historique de vos factures et paiements.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded text-sm" style={{ background: '#FFF5F5', color: '#D13438', border: '1px solid #FCA5A5' }}>
          {error}
        </div>
      )}

      <div className="ms-card overflow-hidden">
        <BillingTable records={records} isLoading={isLoading} />
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#616161]">
            {total} facture{total > 1 ? 's' : ''} au total
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="ms-btn-secondary disabled:opacity-40"
              style={{ padding: '6px 14px', fontSize: '13px' }}
            >
              ← Précédent
            </button>
            <span className="flex items-center px-3 text-sm text-[#616161]">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="ms-btn-secondary disabled:opacity-40"
              style={{ padding: '6px 14px', fontSize: '13px' }}
            >
              Suivant →
            </button>
          </div>
        </div>
      )}

      {records.length === 0 && !isLoading && (
        <div className="ms-card p-8 text-center">
          <p className="text-[#616161] text-sm">Aucune facture pour l&apos;instant.</p>
          <p className="text-xs text-[#ADADAD] mt-1">
            Vos factures apparaîtront ici après chaque transaction.
          </p>
        </div>
      )}
    </div>
  );
}
