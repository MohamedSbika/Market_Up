'use client';

import { useState, useEffect } from 'react';
import { updateAccountSchema } from '@/lib/validations';

interface AccountData {
  name:    string;
  email:   string;
  phone:   string;
  taxId:   string;
  logo:    string;
  type:    'B2B' | 'B2C';
  sector:  string;
  city:    string;
  status:  string;
  slug:    string;
}

export default function AccountPage() {
  const [data,        setData]        = useState<AccountData | null>(null);
  const [isLoading,   setIsLoading]   = useState(true);
  const [isSaving,    setIsSaving]    = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [success,     setSuccess]     = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Form state
  const [name,  setName]  = useState('');
  const [phone, setPhone] = useState('');
  const [taxId, setTaxId] = useState('');
  const [logo,  setLogo]  = useState('');

  useEffect(() => {
    fetch('/api/dashboard/account')
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setName(d.name  ?? '');
        setPhone(d.phone ?? '');
        setTaxId(d.taxId ?? '');
        setLogo(d.logo  ?? '');
      })
      .catch(() => setError('Erreur de chargement.'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setFieldErrors({});

    const parsed = updateAccountSchema.safeParse({ name, phone, taxId, logo });
    if (!parsed.success) {
      const fe = parsed.error.flatten().fieldErrors;
      setFieldErrors({
        name:  fe.name?.[0]  ?? '',
        phone: fe.phone?.[0] ?? '',
        taxId: fe.taxId?.[0] ?? '',
        logo:  fe.logo?.[0]  ?? '',
      });
      return;
    }

    setIsSaving(true);
    try {
      const res  = await fetch('/api/dashboard/account', {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(parsed.data),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? 'Erreur lors de la sauvegarde.');
        return;
      }
      setSuccess(true);
      setData((prev) => prev ? { ...prev, name, phone: phone ?? '', taxId: taxId ?? '', logo: logo ?? '' } : prev);
    } catch {
      setError('Une erreur inattendue est survenue.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-[600px] mx-auto">
        <div className="ms-card p-6 animate-pulse">
          <div className="h-6 bg-[#E0E0E0] rounded w-1/3 mb-4" />
          <div className="space-y-3">
            {[1,2,3,4].map((i) => <div key={i} className="h-10 bg-[#E0E0E0] rounded" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[600px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#242424]" style={{ letterSpacing: '-0.02em' }}>
          Mon compte
        </h1>
        <p className="text-sm text-[#616161] mt-1">Informations de votre entreprise.</p>
      </div>

      {/* Read-only info */}
      {data && (
        <div className="ms-card p-4">
          <h2 className="text-sm font-semibold text-[#242424] mb-3">Informations non modifiables</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-[#616161]">Email</p>
              <p className="font-medium text-[#242424]">{data.email}</p>
            </div>
            <div>
              <p className="text-[#616161]">Type</p>
              <p className="font-medium text-[#242424]">{data.type}</p>
            </div>
            <div>
              <p className="text-[#616161]">Secteur</p>
              <p className="font-medium text-[#242424]">{data.sector}</p>
            </div>
            <div>
              <p className="text-[#616161]">Gouvernorat</p>
              <p className="font-medium text-[#242424]">{data.city}</p>
            </div>
            <div>
              <p className="text-[#616161]">Slug (URL)</p>
              <p className="font-medium text-[#242424] font-mono text-xs">{data.slug}</p>
            </div>
            <div>
              <p className="text-[#616161]">Statut</p>
              <span
                className="inline-block px-2 py-0.5 rounded text-xs font-medium"
                style={{
                  background: data.status === 'active' ? '#DFF6DD' : '#FFF4CE',
                  color:      data.status === 'active' ? '#107C10'  : '#8A6C00',
                }}
              >
                {data.status}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Editable form */}
      <div className="ms-card p-6">
        <h2 className="text-sm font-semibold text-[#242424] mb-4">Informations modifiables</h2>

        {error && (
          <div className="mb-4 p-3 rounded text-sm" style={{ background: '#FFF5F5', color: '#D13438', border: '1px solid #FCA5A5' }}>
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 rounded text-sm" style={{ background: '#DFF6DD', color: '#107C10', border: '1px solid #92C353' }}>
            Informations mises à jour.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="ms-label">Nom de l&apos;entreprise</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`ms-input ${fieldErrors.name ? 'error' : ''}`}
            />
            {fieldErrors.name && <p className="text-xs text-[#D13438] mt-1">{fieldErrors.name}</p>}
          </div>

          <div>
            <label htmlFor="phone" className="ms-label">Téléphone</label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={`ms-input ${fieldErrors.phone ? 'error' : ''}`}
              placeholder="+216 xx xxx xxx"
            />
            {fieldErrors.phone && <p className="text-xs text-[#D13438] mt-1">{fieldErrors.phone}</p>}
          </div>

          <div>
            <label htmlFor="taxId" className="ms-label">Matricule fiscal</label>
            <input
              id="taxId"
              type="text"
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              className="ms-input"
              placeholder="Optionnel"
            />
          </div>

          <div>
            <label htmlFor="logo" className="ms-label">URL du logo</label>
            <input
              id="logo"
              type="url"
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
              className="ms-input"
              placeholder="https://..."
            />
            <p className="text-xs text-[#616161] mt-1">
              Utilisez l&apos;outil d&apos;upload ou saisissez une URL externe.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="ms-btn-primary disabled:opacity-60"
            style={{ padding: '10px 20px' }}
          >
            {isSaving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </form>
      </div>
    </div>
  );
}
