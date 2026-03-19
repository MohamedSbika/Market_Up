'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signUpSchema } from '@/lib/validations';

type Step = 1 | 2;

const SECTORS = [
  'Agriculture', 'Agroalimentaire', 'Artisanat', 'Automobile', 'BTP & Immobilier',
  'Commerce de détail', 'Commerce de gros', 'Communication & Marketing', 'Distribution',
  'Éducation & Formation', 'Électronique & Informatique', 'Énergie', 'Finance & Banque',
  'Hôtellerie & Tourisme', 'Import / Export', 'Industrie manufacturière', 'Logistique & Transport',
  'Médias & Presse', 'Médical & Santé', 'Mode & Textile', 'Restauration', 'Services B2B',
  'Services B2C', 'Télécom', 'Autre',
];

const CITIES = [
  'Ariana', 'Béja', 'Ben Arous', 'Bizerte', 'Gabès', 'Gafsa', 'Jendouba', 'Kairouan',
  'Kasserine', 'Kébili', 'La Manouba', 'Le Kef', 'Mahdia', 'Médenine', 'Monastir',
  'Nabeul', 'Sfax', 'Sidi Bouzid', 'Siliana', 'Sousse', 'Tataouine', 'Tozeur', 'Tunis',
  'Zaghouan',
];

export default function SignUpForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const initialType  = (searchParams.get('type') === 'B2C' ? 'B2C' : 'B2B') as 'B2B' | 'B2C';

  const [step, setStep]           = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess]     = useState(false);

  const [type,      setType]      = useState<'B2B' | 'B2C'>(initialType);
  const [name,      setName]      = useState('');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [rneNumber, setRneNumber] = useState('');
  const [taxId,     setTaxId]     = useState('');
  const [sector,    setSector]    = useState('');
  const [city,      setCity]      = useState('');

  const validateStep1 = () => {
    const result = signUpSchema.pick({ name: true, email: true, password: true, type: true }).safeParse({ name, email, password, type });
    if (!result.success) {
      const fe = result.error.flatten().fieldErrors;
      setFieldErrors({
        name:     fe.name?.[0]     ?? '',
        email:    fe.email?.[0]    ?? '',
        password: fe.password?.[0] ?? '',
      });
      return false;
    }
    setFieldErrors({});
    return true;
  };

  const handleNext = () => {
    setError(null);
    if (validateStep1()) setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const parsed = signUpSchema.safeParse({ name, email, password, type, rneNumber, taxId, sector, city });
    if (!parsed.success) {
      const fe = parsed.error.flatten().fieldErrors;
      setFieldErrors({
        rneNumber: fe.rneNumber?.[0] ?? '',
        sector:    fe.sector?.[0]    ?? '',
        city:      fe.city?.[0]      ?? '',
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/companies', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(parsed.data),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setError('Un compte avec cet email existe déjà.');
        } else {
          setError(data.error ?? 'Une erreur est survenue. Réessayez.');
        }
        return;
      }

      setSuccess(true);
    } catch {
      setError('Une erreur inattendue est survenue. Réessayez.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md">
        <div className="ms-card" style={{ padding: '32px', textAlign: 'center' }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#DFF6DD' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17l-5-5" stroke="#107C10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="font-bold text-2xl text-[#242424] mb-2" style={{ letterSpacing: '-0.02em' }}>
            Compte créé !
          </h1>
          <p className="text-sm text-[#616161] mb-6">
            Un email de vérification a été envoyé à <strong>{email}</strong>.
            Vérifiez votre boîte mail et cliquez sur le lien pour activer votre compte.
          </p>
          <button
            onClick={() => router.push('/signin')}
            className="ms-btn-primary w-full justify-center"
            style={{ padding: '10px 20px' }}
          >
            Aller à la connexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg">
      <div className="ms-card" style={{ padding: '32px' }}>
        <div className="flex items-center justify-between mb-1">
          <h1 className="font-bold text-2xl text-[#242424]" style={{ letterSpacing: '-0.02em' }}>
            Créer un compte
          </h1>
          <span className="text-sm text-[#616161]">Étape {step}/2</span>
        </div>
        <p className="text-sm text-[#616161] mb-6">
          Inscrivez votre entreprise sur MARKET-UP.
        </p>

        {/* Step indicator */}
        <div className="flex gap-2 mb-6">
          <div className="h-1 flex-1 rounded-full" style={{ background: '#0078D4' }} />
          <div className="h-1 flex-1 rounded-full" style={{ background: step === 2 ? '#0078D4' : '#E0E0E0' }} />
        </div>

        {error && (
          <div className="mb-4 p-3 rounded text-sm" style={{ background: '#FFF5F5', color: '#D13438', border: '1px solid #FCA5A5' }}>
            {error}
          </div>
        )}

        {step === 1 ? (
          <div className="space-y-4">
            <div>
              <label className="ms-label">Type d&apos;entreprise</label>
              <div className="flex gap-3 mt-1">
                {(['B2B', 'B2C'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className="flex-1 py-2 px-4 rounded text-sm font-medium border transition-colors"
                    style={{
                      background:  type === t ? '#0078D4' : '#FFFFFF',
                      color:       type === t ? '#FFFFFF' : '#242424',
                      borderColor: type === t ? '#0078D4' : '#E0E0E0',
                    }}
                  >
                    {t === 'B2B' ? '🏢 B2B — Entreprise' : '👤 B2C — Grand public'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="name" className="ms-label">Nom de l&apos;entreprise</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`ms-input ${fieldErrors.name ? 'error' : ''}`}
                placeholder="ACME Sarl"
                autoComplete="organization"
              />
              {fieldErrors.name && <p className="text-xs text-[#D13438] mt-1">{fieldErrors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="ms-label">Email professionnel</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`ms-input ${fieldErrors.email ? 'error' : ''}`}
                placeholder="contact@entreprise.tn"
                autoComplete="email"
              />
              {fieldErrors.email && <p className="text-xs text-[#D13438] mt-1">{fieldErrors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="ms-label">Mot de passe</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`ms-input ${fieldErrors.password ? 'error' : ''}`}
                placeholder="8 caractères minimum"
                autoComplete="new-password"
              />
              {fieldErrors.password && <p className="text-xs text-[#D13438] mt-1">{fieldErrors.password}</p>}
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="ms-btn-primary w-full justify-center"
              style={{ padding: '10px 20px' }}
            >
              Suivant →
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="rneNumber" className="ms-label">
                Numéro RNE <span className="text-[#D13438]">*</span>
              </label>
              <input
                id="rneNumber"
                type="text"
                value={rneNumber}
                onChange={(e) => setRneNumber(e.target.value)}
                className={`ms-input ${fieldErrors.rneNumber ? 'error' : ''}`}
                placeholder="Ex: 1234567A"
              />
              {fieldErrors.rneNumber && <p className="text-xs text-[#D13438] mt-1">{fieldErrors.rneNumber}</p>}
            </div>

            <div>
              <label htmlFor="taxId" className="ms-label">Matricule fiscal (optionnel)</label>
              <input
                id="taxId"
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                className="ms-input"
                placeholder="Ex: 1234567ABC/P/A/M/000"
              />
            </div>

            <div>
              <label htmlFor="sector" className="ms-label">
                Secteur d&apos;activité <span className="text-[#D13438]">*</span>
              </label>
              <select
                id="sector"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className={`ms-input ${fieldErrors.sector ? 'error' : ''}`}
              >
                <option value="">Sélectionnez votre secteur</option>
                {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {fieldErrors.sector && <p className="text-xs text-[#D13438] mt-1">{fieldErrors.sector}</p>}
            </div>

            <div>
              <label htmlFor="city" className="ms-label">
                Gouvernorat <span className="text-[#D13438]">*</span>
              </label>
              <select
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={`ms-input ${fieldErrors.city ? 'error' : ''}`}
              >
                <option value="">Sélectionnez votre gouvernorat</option>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {fieldErrors.city && <p className="text-xs text-[#D13438] mt-1">{fieldErrors.city}</p>}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="ms-btn-secondary flex-1 justify-center"
                style={{ padding: '10px 20px' }}
              >
                ← Retour
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="ms-btn-primary flex-1 justify-center disabled:opacity-60"
                style={{ padding: '10px 20px' }}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Inscription…
                  </span>
                ) : 'Créer mon compte'}
              </button>
            </div>
          </form>
        )}

        <p className="text-center text-sm text-[#616161] mt-6">
          Déjà un compte ?{' '}
          <Link href="/signin" className="text-[#0078D4] hover:text-[#106EBE] font-medium">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
