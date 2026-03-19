import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'MARKET-UP — La plateforme des entreprises tunisiennes',
};

const engines = [
  {
    name:        'BrandUP',
    tagline:     'Profils institutionnels',
    description: 'Créez et gérez le profil institutionnel de votre entreprise. Soyez trouvé par des milliers d\'acheteurs B2B et B2C.',
    href:        '/brandup',
    accent:      '#0078D4',
    bg:          '#EFF6FC',
  },
  {
    name:        'TraceUP',
    tagline:     'Profils médias & YouTube',
    description: 'Affichez vos vidéos YouTube par catégorie. Actualités, offres, astuces, emplois — montrez votre savoir-faire.',
    href:        '/traceup',
    accent:      '#8764B8',
    bg:          '#F4F0FB',
  },
  {
    name:        'LinkUP',
    tagline:     'Cartes de contact digitales',
    description: 'Une carte de contact complète avec WhatsApp, GPS, réseaux sociaux. Partagez en un QR code.',
    href:        '/linkup',
    accent:      '#C5A059',
    bg:          '#FEFCE8',
  },
];

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="max-w-[1280px] mx-auto px-6 py-20 text-center">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6"
          style={{ background: '#EFF6FC', color: '#0078D4', border: '1px solid #BFD9F2' }}
        >
          <span className="w-2 h-2 rounded-full bg-[#0078D4]" />
          Plateforme nationale — Tunisie
        </div>

        <h1
          className="text-4xl md:text-5xl font-bold text-[#242424] mb-6 max-w-3xl mx-auto"
          style={{ letterSpacing: '-0.02em', lineHeight: '1.15' }}
        >
          La plateforme qui donne de la visibilité aux entreprises{' '}
          <span style={{ color: '#0078D4' }}>tunisiennes</span>
        </h1>

        <p className="text-lg text-[#616161] mb-10 max-w-xl mx-auto" style={{ lineHeight: '1.7' }}>
          3 moteurs de recherche spécialisés. Des milliers d'entreprises B2B et B2C à découvrir.
          Boostez votre présence digitale dès aujourd'hui.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/signup" className="ms-btn-primary" style={{ padding: '12px 28px', fontSize: '15px' }}>
            Inscrire mon entreprise
          </Link>
          <Link href="/brandup" className="ms-btn-secondary" style={{ padding: '12px 28px', fontSize: '15px' }}>
            Explorer BrandUP
          </Link>
        </div>
      </section>

      {/* Engine cards */}
      <section className="max-w-[1280px] mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold text-[#242424] text-center mb-2" style={{ letterSpacing: '-0.01em' }}>
          3 moteurs, 3 usages
        </h2>
        <p className="text-[#616161] text-center mb-10">Choisissez le moteur adapté à votre besoin.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {engines.map((engine) => (
            <Link
              key={engine.href}
              href={engine.href}
              className="ms-card flex flex-col gap-4 group"
              style={{ textDecoration: 'none' }}
            >
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ background: engine.bg, color: engine.accent }}
              >
                <span className="font-bold text-sm">{engine.name.slice(0, 1)}</span>
              </div>
              <div>
                <h3 className="font-bold text-[#242424] text-lg mb-1" style={{ letterSpacing: '-0.01em' }}>
                  {engine.name}
                </h3>
                <p className="text-sm font-medium mb-2" style={{ color: engine.accent }}>
                  {engine.tagline}
                </p>
                <p className="text-sm text-[#616161]" style={{ lineHeight: '1.6' }}>
                  {engine.description}
                </p>
              </div>
              <div className="mt-auto flex items-center gap-1 text-sm font-medium" style={{ color: engine.accent }}>
                Explorer
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section style={{ background: '#0078D4' }} className="py-16 px-6">
        <div className="max-w-[1280px] mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-3" style={{ letterSpacing: '-0.01em' }}>
            Votre entreprise n'est pas encore visible ?
          </h2>
          <p className="text-[#BFD9F2] mb-8">
            Inscrivez-vous gratuitement et commencez à construire votre présence digitale dès aujourd'hui.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-3 rounded font-semibold text-[#0078D4] bg-white hover:bg-[#EFF6FC] transition-colors"
            style={{ borderRadius: '4px' }}
          >
            Commencer maintenant — C'est gratuit
          </Link>
        </div>
      </section>
    </div>
  );
}
