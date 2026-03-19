import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default:  'MARKET-UP — La plateforme des entreprises tunisiennes',
    template: '%s | MARKET-UP',
  },
  description:
    'MARKET-UP regroupe BrandUP, TraceUP et LinkUP : les 3 moteurs de recherche des entreprises tunisiennes. Boostez votre visibilité.',
  keywords:   ['entreprises tunisiennes', 'BrandUP', 'TraceUP', 'LinkUP', 'B2B', 'Tunisie'],
  openGraph: {
    type:        'website',
    locale:      'fr_TN',
    siteName:    'MARKET-UP',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        {/* Segoe UI Variable is available on Windows; Plus Jakarta Sans as Google Fonts fallback */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: "'Segoe UI Variable', 'Segoe UI', 'Plus Jakarta Sans', system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
