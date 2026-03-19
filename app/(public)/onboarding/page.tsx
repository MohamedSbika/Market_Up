import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Inscription — Choisissez votre type' };

export default function OnboardingPage() {
  return (
    <div className="max-w-[1280px] mx-auto px-6 py-16 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-[#242424] mb-2 text-center" style={{ letterSpacing: '-0.02em' }}>
        Quel type d'entreprise êtes-vous ?
      </h1>
      <p className="text-[#616161] mb-12 text-center">
        Cela nous permet de personnaliser votre expérience MARKET-UP.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        {[
          {
            type:        'B2B',
            title:       'Entreprise B2B',
            description: "Vous vendez à d'autres entreprises. Fournisseurs, prestataires, grossistes.",
            icon: (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0078D4" strokeWidth="1.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            ),
          },
          {
            type:        'B2C',
            title:       'Entreprise B2C',
            description: 'Vous vendez directement aux consommateurs. Commerce de détail, services aux particuliers.',
            icon: (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8764B8" strokeWidth="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            ),
          },
        ].map((opt) => (
          <Link
            key={opt.type}
            href={`/signup?type=${opt.type}`}
            className="ms-card flex flex-col items-center text-center gap-4 hover:scale-[1.01] transition-transform"
            style={{ textDecoration: 'none', padding: '32px 24px' }}
          >
            <div className="w-16 h-16 rounded-xl flex items-center justify-center" style={{ background: '#F5F5F5' }}>
              {opt.icon}
            </div>
            <div>
              <h2 className="font-bold text-[18px] text-[#242424] mb-1">{opt.title}</h2>
              <p className="text-sm text-[#616161]" style={{ lineHeight: '1.6' }}>{opt.description}</p>
            </div>
            <span className="ms-btn-primary w-full justify-center" style={{ display: 'flex' }}>
              Continuer en {opt.type}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
