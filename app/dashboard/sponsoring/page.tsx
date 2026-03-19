'use client';

import { useState, useEffect } from 'react';
import { createSponsoringOrderSchema } from '@/lib/validations';
import { formatDateFR } from '@/lib/utils';

interface SponsoringOrder {
  _id:          string;
  name:         string;
  imageUrl:     string;
  targetUrl:    string;
  sector:       string;
  status:       string;
  desiredStart: string | null;
  desiredEnd:   string | null;
  createdAt:    string;
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  pending:  { label: 'En attente',  color: '#8A6C00', bg: '#FFF4CE' },
  active:   { label: 'Actif',       color: '#107C10', bg: '#DFF6DD' },
  rejected: { label: 'Refusé',      color: '#D13438', bg: '#FFF5F5' },
  expired:  { label: 'Expiré',      color: '#616161', bg: '#F5F5F5' },
};

export default function SponsoringPage() {
  const [orders,   setOrders]   = useState<SponsoringOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [isSaving,  setIsSaving]  = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [success,   setSuccess]   = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [name,         setName]         = useState('');
  const [imageUrl,     setImageUrl]     = useState('');
  const [targetUrl,    setTargetUrl]    = useState('');
  const [sector,       setSector]       = useState('generic');
  const [desiredStart, setDesiredStart] = useState('');
  const [desiredEnd,   setDesiredEnd]   = useState('');

  const fetchOrders = async () => {
    try {
      const res  = await fetch('/api/dashboard/sponsoring');
      const json = await res.json();
      if (res.ok) setOrders(json.orders ?? []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setFieldErrors({});

    const parsed = createSponsoringOrderSchema.safeParse({
      name,
      imageUrl,
      targetUrl,
      sector,
      desiredStart: desiredStart || undefined,
      desiredEnd:   desiredEnd   || undefined,
    });
    if (!parsed.success) {
      const fe = parsed.error.flatten().fieldErrors;
      setFieldErrors({
        name:      fe.name?.[0]      ?? '',
        imageUrl:  fe.imageUrl?.[0]  ?? '',
        targetUrl: fe.targetUrl?.[0] ?? '',
      });
      return;
    }

    setIsSaving(true);
    try {
      const res  = await fetch('/api/dashboard/sponsoring', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(parsed.data),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? 'Erreur.');
        return;
      }
      setSuccess(true);
      setShowForm(false);
      setOrders((prev) => [json.order, ...prev]);
      setName(''); setImageUrl(''); setTargetUrl(''); setSector('generic'); setDesiredStart(''); setDesiredEnd('');
    } catch {
      setError('Erreur inattendue.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-[700px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#242424]" style={{ letterSpacing: '-0.02em' }}>
            Sponsoring
          </h1>
          <p className="text-sm text-[#616161] mt-1">
            Affichez votre bannière sur les pages de recherche.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="ms-btn-primary"
          style={{ padding: '10px 20px' }}
        >
          {showForm ? 'Annuler' : '+ Nouvelle commande'}
        </button>
      </div>

      {success && (
        <div className="p-3 rounded text-sm" style={{ background: '#DFF6DD', color: '#107C10', border: '1px solid #92C353' }}>
          Commande soumise. Notre équipe vous contactera.
        </div>
      )}

      {showForm && (
        <div className="ms-card p-6">
          <h2 className="text-sm font-semibold text-[#242424] mb-4">Nouvelle commande de sponsoring</h2>

          {error && (
            <div className="mb-4 p-3 rounded text-sm" style={{ background: '#FFF5F5', color: '#D13438', border: '1px solid #FCA5A5' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="ms-label">Nom de la campagne</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`ms-input ${fieldErrors.name ? 'error' : ''}`}
                placeholder="Promotion printemps 2026"
              />
              {fieldErrors.name && <p className="text-xs text-[#D13438] mt-1">{fieldErrors.name}</p>}
            </div>

            <div>
              <label className="ms-label">URL de la bannière (image)</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className={`ms-input ${fieldErrors.imageUrl ? 'error' : ''}`}
                placeholder="https://..."
              />
              {fieldErrors.imageUrl && <p className="text-xs text-[#D13438] mt-1">{fieldErrors.imageUrl}</p>}
            </div>

            <div>
              <label className="ms-label">URL de destination (clic)</label>
              <input
                type="url"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                className={`ms-input ${fieldErrors.targetUrl ? 'error' : ''}`}
                placeholder="https://votre-site.tn"
              />
              {fieldErrors.targetUrl && <p className="text-xs text-[#D13438] mt-1">{fieldErrors.targetUrl}</p>}
            </div>

            <div>
              <label className="ms-label">Ciblage secteur</label>
              <input
                type="text"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="ms-input"
                placeholder="generic (toutes pages) ou secteur précis"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="ms-label">Date de début souhaitée</label>
                <input
                  type="date"
                  value={desiredStart}
                  onChange={(e) => setDesiredStart(e.target.value)}
                  className="ms-input"
                />
              </div>
              <div>
                <label className="ms-label">Date de fin souhaitée</label>
                <input
                  type="date"
                  value={desiredEnd}
                  onChange={(e) => setDesiredEnd(e.target.value)}
                  className="ms-input"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="ms-btn-secondary"
                style={{ padding: '10px 20px' }}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="ms-btn-primary disabled:opacity-60"
                style={{ padding: '10px 20px' }}
              >
                {isSaving ? 'Envoi…' : 'Soumettre la commande'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Orders list */}
      <div className="ms-card p-6">
        <h2 className="text-sm font-semibold text-[#242424] mb-4">Mes commandes</h2>
        {isLoading ? (
          <div className="space-y-2 animate-pulse">
            {[1,2].map((i) => <div key={i} className="h-16 bg-[#E0E0E0] rounded" />)}
          </div>
        ) : orders.length === 0 ? (
          <p className="text-sm text-[#616161]">Aucune commande pour l&apos;instant.</p>
        ) : (
          <div className="divide-y divide-[#E0E0E0]">
            {orders.map((order) => {
              const st = STATUS_LABELS[order.status] ?? STATUS_LABELS.pending;
              return (
                <div key={order._id} className="py-3 flex items-start gap-4">
                  {order.imageUrl && (
                    <img
                      src={order.imageUrl}
                      alt={order.name}
                      className="w-16 h-10 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#242424] truncate">{order.name}</p>
                    <p className="text-xs text-[#616161]">
                      Secteur: {order.sector} · Soumis le {formatDateFR(new Date(order.createdAt))}
                    </p>
                  </div>
                  <span
                    className="px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap"
                    style={{ background: st.bg, color: st.color }}
                  >
                    {st.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
