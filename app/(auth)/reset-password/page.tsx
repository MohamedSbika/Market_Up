'use client';

import { useState } from 'react';
import Link from 'next/link';
import { resetPasswordSchema } from '@/lib/validations';

export default function ResetPasswordPage() {
  const [email,     setEmail]     = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [emailError, setEmailError] = useState('');
  const [sent,      setSent]      = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setEmailError('');

    const parsed = resetPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setEmailError(parsed.error.flatten().fieldErrors.email?.[0] ?? '');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email }),
      });

      if (!res.ok && res.status !== 404) {
        setError('Une erreur est survenue. Réessayez.');
        return;
      }

      // Always show success to avoid email enumeration
      setSent(true);
    } catch {
      setError('Une erreur inattendue est survenue. Réessayez.');
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="w-full max-w-md">
        <div className="ms-card" style={{ padding: '32px', textAlign: 'center' }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#EFF6FC' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="#0078D4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="font-bold text-2xl text-[#242424] mb-2" style={{ letterSpacing: '-0.02em' }}>
            Email envoyé
          </h1>
          <p className="text-sm text-[#616161] mb-6">
            Si un compte MARKET-UP existe pour <strong>{email}</strong>, vous recevrez un lien de réinitialisation dans quelques minutes.
          </p>
          <Link href="/signin" className="ms-btn-primary w-full justify-center" style={{ padding: '10px 20px', display: 'flex' }}>
            Retour à la connexion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="ms-card" style={{ padding: '32px' }}>
        <h1 className="font-bold text-2xl text-[#242424] mb-1" style={{ letterSpacing: '-0.02em' }}>
          Mot de passe oublié
        </h1>
        <p className="text-sm text-[#616161] mb-6">
          Entrez votre email et nous vous enverrons un lien de réinitialisation.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded text-sm" style={{ background: '#FFF5F5', color: '#D13438', border: '1px solid #FCA5A5' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="ms-label">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              className={`ms-input ${emailError ? 'error' : ''}`}
              placeholder="contact@entreprise.tn"
            />
            {emailError && <p className="text-xs text-[#D13438] mt-1">{emailError}</p>}
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
                Envoi…
              </span>
            ) : 'Envoyer le lien'}
          </button>
        </form>

        <p className="text-center text-sm text-[#616161] mt-6">
          <Link href="/signin" className="text-[#0078D4] hover:text-[#106EBE] font-medium">
            ← Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  );
}
