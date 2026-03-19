'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signInSchema } from '@/lib/validations';

const ERROR_MESSAGES: Record<string, string> = {
  EMAIL_NOT_VERIFIED: 'Votre email n\'est pas encore vérifié. Vérifiez votre boîte mail.',
  ACCOUNT_SUSPENDED:  'Votre compte est suspendu. Contactez le support.',
  ACCOUNT_PENDING:    'Votre compte est en cours de validation par notre équipe.',
  CredentialsSignin:  'Email ou mot de passe incorrect.',
};

export default function SignInForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl  = searchParams.get('callbackUrl') ?? '/dashboard';
  const urlError     = searchParams.get('error');

  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(
    urlError ? (ERROR_MESSAGES[urlError] ?? 'Une erreur est survenue.') : null
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const parsed = signInSchema.safeParse({ email, password });
    if (!parsed.success) {
      const fe = parsed.error.flatten().fieldErrors;
      setFieldErrors({
        email:    fe.email?.[0]    ?? '',
        password: fe.password?.[0] ?? '',
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(ERROR_MESSAGES[result.error] ?? 'Email ou mot de passe incorrect.');
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError('Une erreur inattendue est survenue. Réessayez.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="ms-card" style={{ padding: '32px' }}>
        <h1 className="font-bold text-2xl text-[#242424] mb-1" style={{ letterSpacing: '-0.02em' }}>
          Connexion
        </h1>
        <p className="text-sm text-[#616161] mb-6">
          Accédez à votre espace entreprise MARKET-UP.
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
              className={`ms-input ${fieldErrors.email ? 'error' : ''}`}
              placeholder="contact@entreprise.tn"
            />
            {fieldErrors.email && <p className="text-xs text-[#D13438] mt-1">{fieldErrors.email}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="ms-label mb-0">Mot de passe</label>
              <Link href="/reset-password" className="text-xs text-[#0078D4] hover:text-[#106EBE]">
                Mot de passe oublié ?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className={`ms-input ${fieldErrors.password ? 'error' : ''}`}
              placeholder="••••••••"
            />
            {fieldErrors.password && <p className="text-xs text-[#D13438] mt-1">{fieldErrors.password}</p>}
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
                Connexion…
              </span>
            ) : 'Se connecter'}
          </button>
        </form>

        <p className="text-center text-sm text-[#616161] mt-6">
          Pas encore de compte ?{' '}
          <Link href="/signup" className="text-[#0078D4] hover:text-[#106EBE] font-medium">
            Inscrire mon entreprise
          </Link>
        </p>
      </div>
    </div>
  );
}
