'use client';

import { useState, useEffect } from 'react';
import { updateLinkUpSchema } from '@/lib/validations';
import { QRCodeDisplay } from '@/components/dashboard/QRCodeDisplay';

interface LinkUpData {
  status:    string;
  isPublic:  boolean;
  whatsapp:  string;
  gpsUrl:    string;
  website:   string;
  linkedin:  string;
  facebook:  string;
  instagram: string;
  youtube:   string;
  viewCount: number;
  slug:      string;
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  active:   { label: 'Actif',         color: '#107C10', bg: '#DFF6DD' },
  pending:  { label: 'En validation', color: '#8A6C00', bg: '#FFF4CE' },
  disabled: { label: 'Désactivé',     color: '#616161', bg: '#F5F5F5' },
};

export default function LinkUpDashboardPage() {
  const [data,        setData]        = useState<LinkUpData | null>(null);
  const [isLoading,   setIsLoading]   = useState(true);
  const [isSaving,    setIsSaving]    = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [success,     setSuccess]     = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [isPublic,  setIsPublic]  = useState(false);
  const [whatsapp,  setWhatsapp]  = useState('');
  const [gpsUrl,    setGpsUrl]    = useState('');
  const [website,   setWebsite]   = useState('');
  const [linkedin,  setLinkedin]  = useState('');
  const [facebook,  setFacebook]  = useState('');
  const [instagram, setInstagram] = useState('');
  const [youtube,   setYoutube]   = useState('');

  useEffect(() => {
    fetch('/api/dashboard/linkup')
      .then((r) => r.json())
      .then((d: LinkUpData) => {
        setData(d);
        setIsPublic(d.isPublic);
        setWhatsapp(d.whatsapp  ?? '');
        setGpsUrl(d.gpsUrl      ?? '');
        setWebsite(d.website    ?? '');
        setLinkedin(d.linkedin  ?? '');
        setFacebook(d.facebook  ?? '');
        setInstagram(d.instagram ?? '');
        setYoutube(d.youtube    ?? '');
      })
      .catch(() => setError('Erreur de chargement.'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setFieldErrors({});

    const parsed = updateLinkUpSchema.safeParse({
      isPublic, whatsapp, gpsUrl, website, linkedin, facebook, instagram, youtube,
    });
    if (!parsed.success) {
      const fe = parsed.error.flatten().fieldErrors;
      setFieldErrors({
        whatsapp:  fe.whatsapp?.[0]  ?? '',
        gpsUrl:    fe.gpsUrl?.[0]    ?? '',
        website:   fe.website?.[0]   ?? '',
        linkedin:  fe.linkedin?.[0]  ?? '',
        facebook:  fe.facebook?.[0]  ?? '',
        instagram: fe.instagram?.[0] ?? '',
        youtube:   fe.youtube?.[0]   ?? '',
      });
      return;
    }

    setIsSaving(true);
    try {
      const res  = await fetch('/api/dashboard/linkup', {
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
      if (json.profile) setData((prev) => prev ? { ...prev, ...json.profile } : prev);
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
          {[1,2,3,4].map((i) => <div key={i} className="h-10 bg-[#E0E0E0] rounded" />)}
        </div>
      </div>
    );
  }

  const statusInfo = STATUS_LABELS[data?.status ?? 'disabled'];
  const profileUrl = typeof window !== 'undefined' ? `${window.location.origin}/linkup/${data?.slug}` : '';

  return (
    <div className="max-w-[700px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#242424]" style={{ letterSpacing: '-0.02em' }}>
            Profil LinkUP
          </h1>
          <p className="text-sm text-[#616161] mt-1">Carte de contact numérique.</p>
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
          Profil mis à jour.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Visibility */}
        <div className="ms-card p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#242424]">Rendre le profil public</p>
            <p className="text-xs text-[#616161] mt-0.5">
              WhatsApp et GPS requis pour activer.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsPublic(!isPublic)}
            className="relative w-12 h-6 rounded-full transition-colors"
            style={{ background: isPublic ? '#C5A059' : '#E0E0E0' }}
          >
            <span
              className="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform"
              style={{ left: isPublic ? '26px' : '4px' }}
            />
          </button>
        </div>

        {/* Required fields */}
        <div className="ms-card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-[#242424]">
            Champs requis{' '}
            <span className="text-[#D13438]">*</span>
          </h2>

          <div>
            <label className="ms-label">WhatsApp</label>
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className={`ms-input ${fieldErrors.whatsapp ? 'error' : ''}`}
              placeholder="+216 xx xxx xxx"
            />
            {fieldErrors.whatsapp && <p className="text-xs text-[#D13438] mt-1">{fieldErrors.whatsapp}</p>}
          </div>

          <div>
            <label className="ms-label">Lien GPS / Localisation</label>
            <input
              type="url"
              value={gpsUrl}
              onChange={(e) => setGpsUrl(e.target.value)}
              className={`ms-input ${fieldErrors.gpsUrl ? 'error' : ''}`}
              placeholder="https://maps.google.com/..."
            />
            {fieldErrors.gpsUrl && <p className="text-xs text-[#D13438] mt-1">{fieldErrors.gpsUrl}</p>}
          </div>
        </div>

        {/* Social links */}
        <div className="ms-card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-[#242424]">Réseaux sociaux & liens</h2>

          {[
            { key: 'website',   label: 'Site web',  value: website,   setter: setWebsite },
            { key: 'linkedin',  label: 'LinkedIn',  value: linkedin,  setter: setLinkedin },
            { key: 'facebook',  label: 'Facebook',  value: facebook,  setter: setFacebook },
            { key: 'instagram', label: 'Instagram', value: instagram, setter: setInstagram },
            { key: 'youtube',   label: 'YouTube',   value: youtube,   setter: setYoutube },
          ].map(({ key, label, value, setter }) => (
            <div key={key}>
              <label className="ms-label">{label}</label>
              <input
                type="url"
                value={value}
                onChange={(e) => setter(e.target.value)}
                className={`ms-input ${fieldErrors[key] ? 'error' : ''}`}
                placeholder="https://..."
              />
              {fieldErrors[key] && <p className="text-xs text-[#D13438] mt-1">{fieldErrors[key]}</p>}
            </div>
          ))}
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

      {/* QR Code */}
      {data?.status === 'active' && profileUrl && (
        <div className="ms-card p-6">
          <h2 className="text-sm font-semibold text-[#242424] mb-4">QR Code de votre profil</h2>
          <QRCodeDisplay value={profileUrl} />
        </div>
      )}
    </div>
  );
}
