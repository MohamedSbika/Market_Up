'use client';

import { useState, useEffect } from 'react';
import { updateBrandUpSchema } from '@/lib/validations';
import { GalleryUpload } from '@/components/dashboard/GalleryUpload';

interface GalleryItem {
  url: string;
  uploadedAt: string;
}

interface BrandUpData {
  status:           string;
  isPublic:         boolean;
  shortDescription: string;
  about:            string;
  sector:           string;
  city:             string;
  address:          string;
  phone:            string;
  email:            string;
  foundedYear:      number | null;
  employeesCount:   number | null;
  clientsCount:     number | null;
  gallery:          GalleryItem[];
  viewCount:        number;
  isBoostActive:    boolean;
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  active:   { label: 'Actif',           color: '#107C10', bg: '#DFF6DD' },
  pending:  { label: 'En validation',   color: '#8A6C00', bg: '#FFF4CE' },
  disabled: { label: 'Désactivé',       color: '#616161', bg: '#F5F5F5' },
  rejected: { label: 'Refusé',          color: '#D13438', bg: '#FFF5F5' },
};

export default function BrandUpDashboardPage() {
  const [data,        setData]        = useState<BrandUpData | null>(null);
  const [isLoading,   setIsLoading]   = useState(true);
  const [isSaving,    setIsSaving]    = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [success,     setSuccess]     = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [isPublic,         setIsPublic]         = useState(false);
  const [shortDescription, setShortDescription] = useState('');
  const [about,            setAbout]            = useState('');
  const [sector,           setSector]           = useState('');
  const [city,             setCity]             = useState('');
  const [address,          setAddress]          = useState('');
  const [phone,            setPhone]            = useState('');
  const [email,            setEmail]            = useState('');
  const [foundedYear,      setFoundedYear]      = useState('');
  const [employeesCount,   setEmployeesCount]   = useState('');
  const [clientsCount,     setClientsCount]     = useState('');
  const [gallery,          setGallery]          = useState<GalleryItem[]>([]);

  useEffect(() => {
    fetch('/api/dashboard/brandup')
      .then((r) => r.json())
      .then((d: BrandUpData) => {
        setData(d);
        setIsPublic(d.isPublic);
        setShortDescription(d.shortDescription ?? '');
        setAbout(d.about             ?? '');
        setSector(d.sector           ?? '');
        setCity(d.city               ?? '');
        setAddress(d.address         ?? '');
        setPhone(d.phone             ?? '');
        setEmail(d.email             ?? '');
        setFoundedYear(d.foundedYear  != null ? String(d.foundedYear)  : '');
        setEmployeesCount(d.employeesCount != null ? String(d.employeesCount) : '');
        setClientsCount(d.clientsCount   != null ? String(d.clientsCount)   : '');
        setGallery(d.gallery ?? []);
      })
      .catch(() => setError('Erreur de chargement.'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setFieldErrors({});

    const payload = {
      isPublic,
      shortDescription: shortDescription || undefined,
      about:            about            || undefined,
      sector:           sector           || undefined,
      city:             city             || undefined,
      address:          address          || undefined,
      phone:            phone            || undefined,
      email:            email            || undefined,
      foundedYear:      foundedYear    ? Number(foundedYear)    : undefined,
      employeesCount:   employeesCount ? Number(employeesCount) : undefined,
      clientsCount:     clientsCount   ? Number(clientsCount)   : undefined,
      gallery,
    };

    const parsed = updateBrandUpSchema.safeParse(payload);
    if (!parsed.success) {
      const fe = parsed.error.flatten().fieldErrors;
      setFieldErrors({
        shortDescription: fe.shortDescription?.[0] ?? '',
        about:            fe.about?.[0]            ?? '',
        sector:           fe.sector?.[0]           ?? '',
        city:             fe.city?.[0]             ?? '',
        phone:            fe.phone?.[0]            ?? '',
        email:            fe.email?.[0]            ?? '',
      });
      return;
    }

    setIsSaving(true);
    try {
      const res  = await fetch('/api/dashboard/brandup', {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ...parsed.data, gallery }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? 'Erreur lors de la sauvegarde.');
        return;
      }
      setSuccess(true);
      if (json.profile) setData(json.profile);
    } catch {
      setError('Une erreur inattendue est survenue.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-[700px] mx-auto">
        <div className="ms-card p-6 animate-pulse space-y-3">
          {[1,2,3,4,5].map((i) => <div key={i} className="h-10 bg-[#E0E0E0] rounded" />)}
        </div>
      </div>
    );
  }

  const statusInfo = STATUS_LABELS[data?.status ?? 'disabled'];

  return (
    <div className="max-w-[700px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#242424]" style={{ letterSpacing: '-0.02em' }}>
            Profil BrandUP
          </h1>
          <p className="text-sm text-[#616161] mt-1">Gérez votre profil institutionnel.</p>
        </div>
        {statusInfo && (
          <span
            className="px-3 py-1 rounded-full text-xs font-semibold"
            style={{ background: statusInfo.bg, color: statusInfo.color }}
          >
            {statusInfo.label}
          </span>
        )}
      </div>

      {error && (
        <div className="p-3 rounded text-sm" style={{ background: '#FFF5F5', color: '#D13438', border: '1px solid #FCA5A5' }}>
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 rounded text-sm" style={{ background: '#DFF6DD', color: '#107C10', border: '1px solid #92C353' }}>
          Profil mis à jour. {data?.status === 'pending' ? 'Il est en cours de validation.' : ''}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Visibility toggle */}
        <div className="ms-card p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#242424]">Rendre le profil public</p>
            <p className="text-xs text-[#616161] mt-0.5">
              Activer pour soumettre à validation et apparaître dans BrandUP.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsPublic(!isPublic)}
            className="relative w-12 h-6 rounded-full transition-colors"
            style={{ background: isPublic ? '#0078D4' : '#E0E0E0' }}
          >
            <span
              className="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform"
              style={{ left: isPublic ? '26px' : '4px' }}
            />
          </button>
        </div>

        {/* Basic info */}
        <div className="ms-card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-[#242424]">Présentation</h2>

          <div>
            <label className="ms-label">Accroche courte (max 200 caractères)</label>
            <input
              type="text"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              maxLength={200}
              className={`ms-input ${fieldErrors.shortDescription ? 'error' : ''}`}
              placeholder="Ce que fait votre entreprise en une ligne."
            />
            <p className="text-xs text-[#616161] mt-1">{shortDescription.length}/200</p>
          </div>

          <div>
            <label className="ms-label">À propos (max 2000 caractères)</label>
            <textarea
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              maxLength={2000}
              rows={5}
              className={`ms-input resize-none ${fieldErrors.about ? 'error' : ''}`}
              placeholder="Décrivez votre entreprise, vos valeurs, votre histoire…"
            />
            <p className="text-xs text-[#616161] mt-1">{about.length}/2000</p>
          </div>
        </div>

        {/* Contact & location */}
        <div className="ms-card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-[#242424]">Contact & localisation</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="ms-label">Secteur</label>
              <input
                type="text"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className={`ms-input ${fieldErrors.sector ? 'error' : ''}`}
              />
            </div>
            <div>
              <label className="ms-label">Gouvernorat</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={`ms-input ${fieldErrors.city ? 'error' : ''}`}
              />
            </div>
          </div>

          <div>
            <label className="ms-label">Adresse complète</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="ms-input"
              placeholder="Rue, numéro, ville"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="ms-label">Téléphone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`ms-input ${fieldErrors.phone ? 'error' : ''}`}
                placeholder="+216 xx xxx xxx"
              />
            </div>
            <div>
              <label className="ms-label">Email de contact</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`ms-input ${fieldErrors.email ? 'error' : ''}`}
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="ms-card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-[#242424]">Chiffres clés</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="ms-label">Année de création</label>
              <input
                type="number"
                value={foundedYear}
                onChange={(e) => setFoundedYear(e.target.value)}
                className="ms-input"
                min="1900"
                max={new Date().getFullYear()}
                placeholder="2010"
              />
            </div>
            <div>
              <label className="ms-label">Employés</label>
              <input
                type="number"
                value={employeesCount}
                onChange={(e) => setEmployeesCount(e.target.value)}
                className="ms-input"
                min="0"
                placeholder="50"
              />
            </div>
            <div>
              <label className="ms-label">Clients</label>
              <input
                type="number"
                value={clientsCount}
                onChange={(e) => setClientsCount(e.target.value)}
                className="ms-input"
                min="0"
                placeholder="200"
              />
            </div>
          </div>
        </div>

        {/* Gallery */}
        <div className="ms-card p-6">
          <h2 className="text-sm font-semibold text-[#242424] mb-4">Galerie photos (max 10)</h2>
          <GalleryUpload value={gallery} onChange={setGallery} />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="ms-btn-primary disabled:opacity-60"
            style={{ padding: '10px 24px' }}
          >
            {isSaving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
}
