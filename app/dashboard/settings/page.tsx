'use client';

import { useState } from 'react';
import { changePasswordSchema } from '@/lib/validations';
import { signOut } from 'next-auth/react';

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword,     setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading,       setIsLoading]       = useState(false);
  const [error,           setError]           = useState<string | null>(null);
  const [success,         setSuccess]         = useState(false);
  const [fieldErrors,     setFieldErrors]     = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setFieldErrors({});

    if (newPassword !== confirmPassword) {
      setFieldErrors({ confirmPassword: 'Les mots de passe ne correspondent pas.' });
      return;
    }

    const parsed = changePasswordSchema.safeParse({ currentPassword, newPassword });
    if (!parsed.success) {
      const fe = parsed.error.flatten().fieldErrors;
      setFieldErrors({
        currentPassword: fe.currentPassword?.[0] ?? '',
        newPassword:     fe.newPassword?.[0]     ?? '',
      });
      return;
    }

    setIsLoading(true);
    try {
      const res  = await fetch('/api/dashboard/settings', {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(parsed.data),
      });
      const json = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          setError('Mot de passe actuel incorrect.');
        } else {
          setError(json.error ?? 'Erreur lors de la mise à jour.');
        }
        return;
      }

      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      setError('Une erreur inattendue est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-[600px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#242424]" style={{ letterSpacing: '-0.02em' }}>
          Paramètres
        </h1>
        <p className="text-sm text-[#616161] mt-1">Sécurité et préférences de votre compte.</p>
      </div>

      {/* Change password */}
      <div className="ms-card p-6">
        <h2 className="text-base font-semibold text-[#242424] mb-4">Changer le mot de passe</h2>

        {error && (
          <div className="mb-4 p-3 rounded text-sm" style={{ background: '#FFF5F5', color: '#D13438', border: '1px solid #FCA5A5' }}>
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 rounded text-sm" style={{ background: '#DFF6DD', color: '#107C10', border: '1px solid #92C353' }}>
            Mot de passe mis à jour avec succès.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="currentPassword" className="ms-label">Mot de passe actuel</label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              required
              className={`ms-input ${fieldErrors.currentPassword ? 'error' : ''}`}
            />
            {fieldErrors.currentPassword && (
              <p className="text-xs text-[#D13438] mt-1">{fieldErrors.currentPassword}</p>
            )}
          </div>

          <div>
            <label htmlFor="newPassword" className="ms-label">Nouveau mot de passe</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              required
              className={`ms-input ${fieldErrors.newPassword ? 'error' : ''}`}
              placeholder="8 caractères minimum"
            />
            {fieldErrors.newPassword && (
              <p className="text-xs text-[#D13438] mt-1">{fieldErrors.newPassword}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="ms-label">Confirmer le nouveau mot de passe</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
              className={`ms-input ${fieldErrors.confirmPassword ? 'error' : ''}`}
            />
            {fieldErrors.confirmPassword && (
              <p className="text-xs text-[#D13438] mt-1">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="ms-btn-primary disabled:opacity-60"
            style={{ padding: '10px 20px' }}
          >
            {isLoading ? 'Mise à jour…' : 'Mettre à jour'}
          </button>
        </form>
      </div>

      {/* Danger zone */}
      <div className="ms-card p-6" style={{ border: '1px solid #FCA5A5' }}>
        <h2 className="text-base font-semibold text-[#D13438] mb-4">Zone de danger</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#242424]">Se déconnecter</p>
            <p className="text-xs text-[#616161] mt-0.5">Terminer votre session en cours.</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/signin' })}
            className="ms-btn-secondary text-sm"
            style={{ padding: '8px 16px', color: '#D13438', borderColor: '#D13438' }}
          >
            Déconnexion
          </button>
        </div>
      </div>
    </div>
  );
}
