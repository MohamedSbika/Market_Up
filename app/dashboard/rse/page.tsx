'use client';

import { useState, useEffect } from 'react';
import { addDonationSchema } from '@/lib/validations';
import { formatDateFR } from '@/lib/utils';

interface Donation {
  _id:         string;
  beneficiary: string;
  amount:      number;
  receiptUrl:  string;
  status:      string;
  submittedAt: string;
  validatedAt?: string;
}

interface RSEData {
  badgeActive: boolean;
  donations:   Donation[];
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: 'En attente',  color: '#8A6C00', bg: '#FFF4CE' },
  validated: { label: 'Validé',      color: '#107C10', bg: '#DFF6DD' },
  rejected:  { label: 'Refusé',      color: '#D13438', bg: '#FFF5F5' },
};

export default function RSEPage() {
  const [data,      setData]      = useState<RSEData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [isSaving,  setIsSaving]  = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [success,   setSuccess]   = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [beneficiary, setBeneficiary] = useState('');
  const [amount,      setAmount]      = useState('');
  const [receiptUrl,  setReceiptUrl]  = useState('');

  useEffect(() => {
    fetch('/api/dashboard/rse')
      .then((r) => r.json())
      .then(setData)
      .catch(() => setError('Erreur de chargement.'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setFieldErrors({});

    const parsed = addDonationSchema.safeParse({
      beneficiary,
      amount:     Number(amount),
      receiptUrl,
    });
    if (!parsed.success) {
      const fe = parsed.error.flatten().fieldErrors;
      setFieldErrors({
        beneficiary: fe.beneficiary?.[0] ?? '',
        amount:      fe.amount?.[0]      ?? '',
        receiptUrl:  fe.receiptUrl?.[0]  ?? '',
      });
      return;
    }

    setIsSaving(true);
    try {
      const res  = await fetch('/api/dashboard/rse', {
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
      setData((prev) => prev ? { ...prev, donations: [json.donation, ...prev.donations] } : prev);
      setBeneficiary(''); setAmount(''); setReceiptUrl('');
    } catch {
      setError('Erreur inattendue.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-[700px] mx-auto">
        <div className="ms-card p-6 animate-pulse space-y-3">
          {[1,2,3].map((i) => <div key={i} className="h-10 bg-[#E0E0E0] rounded" />)}
        </div>
      </div>
    );
  }

  const validatedCount = data?.donations.filter((d) => d.status === 'validated').length ?? 0;

  return (
    <div className="max-w-[700px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#242424]" style={{ letterSpacing: '-0.02em' }}>
          Badge RSE
        </h1>
        <p className="text-sm text-[#616161] mt-1">
          Valorisez vos engagements sociétaux et obtenez le badge RSE.
        </p>
      </div>

      {/* Badge status */}
      <div
        className="ms-card p-5 flex items-center gap-4"
        style={{ borderLeft: `4px solid ${data?.badgeActive ? '#C5A059' : '#E0E0E0'}` }}
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold"
          style={{
            background: data?.badgeActive ? '#C5A059' : '#E0E0E0',
            color:      data?.badgeActive ? '#FFFFFF'  : '#616161',
          }}
        >
          ✓
        </div>
        <div>
          <p className="font-semibold text-[#242424]">
            {data?.badgeActive ? 'Badge RSE actif' : 'Badge RSE inactif'}
          </p>
          <p className="text-sm text-[#616161]">
            {data?.badgeActive
              ? `Visible sur vos profils publics. ${validatedCount} don(s) validé(s).`
              : `${validatedCount} / 1 don(s) validé(s) requis pour activer.`}
          </p>
        </div>
      </div>

      {/* What is RSE */}
      <div className="ms-card p-6">
        <h2 className="text-sm font-semibold text-[#242424] mb-3">Comment obtenir le badge ?</h2>
        <div className="space-y-2 text-sm text-[#424242]">
          <p>1. Soumettez un justificatif de don (reçu officiel, virement, attestation).</p>
          <p>2. Notre équipe valide votre contribution.</p>
          <p>3. Le badge RSE doré s&apos;affiche sur vos profils BrandUP, TraceUP et LinkUP.</p>
        </div>
      </div>

      {/* Add donation */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(!showForm)}
          className="ms-btn-primary"
          style={{ padding: '10px 20px' }}
        >
          {showForm ? 'Annuler' : '+ Ajouter un don'}
        </button>
      </div>

      {success && (
        <div className="p-3 rounded text-sm" style={{ background: '#DFF6DD', color: '#107C10', border: '1px solid #92C353' }}>
          Don soumis. Notre équipe validera votre contribution.
        </div>
      )}

      {showForm && (
        <div className="ms-card p-6">
          <h2 className="text-sm font-semibold text-[#242424] mb-4">Soumettre un don</h2>

          {error && (
            <div className="mb-4 p-3 rounded text-sm" style={{ background: '#FFF5F5', color: '#D13438', border: '1px solid #FCA5A5' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="ms-label">Bénéficiaire</label>
              <input
                type="text"
                value={beneficiary}
                onChange={(e) => setBeneficiary(e.target.value)}
                className={`ms-input ${fieldErrors.beneficiary ? 'error' : ''}`}
                placeholder="Association, fondation, ONG…"
              />
              {fieldErrors.beneficiary && <p className="text-xs text-[#D13438] mt-1">{fieldErrors.beneficiary}</p>}
            </div>

            <div>
              <label className="ms-label">Montant (DT)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`ms-input ${fieldErrors.amount ? 'error' : ''}`}
                min="1"
                step="0.001"
                placeholder="500"
              />
              {fieldErrors.amount && <p className="text-xs text-[#D13438] mt-1">{fieldErrors.amount}</p>}
            </div>

            <div>
              <label className="ms-label">URL du justificatif</label>
              <input
                type="url"
                value={receiptUrl}
                onChange={(e) => setReceiptUrl(e.target.value)}
                className={`ms-input ${fieldErrors.receiptUrl ? 'error' : ''}`}
                placeholder="https://... (PDF, image)"
              />
              {fieldErrors.receiptUrl && <p className="text-xs text-[#D13438] mt-1">{fieldErrors.receiptUrl}</p>}
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
                {isSaving ? 'Envoi…' : 'Soumettre'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Donations history */}
      <div className="ms-card p-6">
        <h2 className="text-sm font-semibold text-[#242424] mb-4">Historique des dons</h2>
        {(data?.donations.length ?? 0) === 0 ? (
          <p className="text-sm text-[#616161]">Aucun don soumis pour l&apos;instant.</p>
        ) : (
          <div className="divide-y divide-[#E0E0E0]">
            {data?.donations.map((donation) => {
              const st = STATUS_LABELS[donation.status] ?? STATUS_LABELS.pending;
              return (
                <div key={donation._id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#242424]">{donation.beneficiary}</p>
                    <p className="text-xs text-[#616161]">
                      {donation.amount.toFixed(3)} DT ·{' '}
                      {formatDateFR(new Date(donation.submittedAt))}
                      {donation.validatedAt && ` · validé le ${formatDateFR(new Date(donation.validatedAt))}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className="px-2 py-0.5 rounded text-xs font-medium"
                      style={{ background: st.bg, color: st.color }}
                    >
                      {st.label}
                    </span>
                    <a
                      href={donation.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#0078D4] hover:text-[#106EBE]"
                    >
                      Justificatif
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
