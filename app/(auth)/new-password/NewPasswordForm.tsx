'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { newPasswordSchema } from '@/lib/validations';

export default function NewPasswordForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const token        = searchParams.get('token') ?? '';

  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success,   setSuccess]   = useState(false);

  if (!token) {
    return (
      <div className="w-full max-w-md">
        <div className="ms-card" style={{ padding: '32px', textAlign: 'center' }}>
          <p className="text-sm text-[#D13438] mb-4">Lien invalide ou expiré.</p>
          <Link href="/reset-password" className="text-[#0078D4] hover:text-[#106EBE] text-sm font-medium">
            Demander un nouveau lien
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (password !== confirm) {
      setFieldErrors({ confirm: 'Les mots de passe ne correspondent pas.' });
      return;
    }

    const parsed = newPasswordSchema.safeParse({ token, password });
    if (!parsed.success) {
      const fe = parsed.error.flatten().fieldErrors;
      setFieldErrors({ password: fe.password?.[0] ?? '' });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/new-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 400 || res.status === 404) {
          setError('Lien invalide ou expiré. Demandez un nouveau lien.');
        } else {
          setError(data.error ?? 'Une erreur est survenue.');
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
            Mot de passe mis à jour
          </h1>
          <p className="text-sm text-[#616161] mb-6">
            Votre mot de passe a été réinitialisé avec succès.
          </p>
          <button
            onClick={() => router.push('/signin')}
            className="ms-btn-primary w-full justify-center"
            style={{ padding: '10px 20px' }}
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="ms-card" style={{ padding: '32px' }}>
        <h1 className="font-bold text-2xl text-[#242424] mb-1" style={{ letterSpacing: '-0.02em' }}>
          Nouveau mot de passe
        </h1>
        <p className="text-sm text-[#616161] mb-6">
          Choisissez un nouveau mot de passe pour votre compte.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded text-sm" style={{ background: '#FFF5F5', color: '#D13438', border: '1px solid #FCA5A5' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="ms-label">Nouveau mot de passe</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              className={`ms-input ${fieldErrors.password ? 'error' : ''}`}
              placeholder="8 caractères minimum"
            />
            {fieldErrors.password && <p className="text-xs text-[#D13438] mt-1">{fieldErrors.password}</p>}
          </div>

          <div>
            <label htmlFor="confirm" className="ms-label">Confirmer le mot de passe</label>
            <input
              id="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              required
              className={`ms-input ${fieldErrors.confirm ? 'error' : ''}`}
              placeholder="Répétez le mot de passe"
            />
            {fieldErrors.confirm && <p className="text-xs text-[#D13438] mt-1">{fieldErrors.confirm}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="ms-btn-primary w-full justify-center disabled:opacity-60"
            style={{ padding: '10px 20px' }}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Mise à jour…
              </span>
            ) : 'Mettre à jour'}
          </button>
        </form>
      </div>
    </div>
  );
}
