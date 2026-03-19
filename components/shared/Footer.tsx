/**
 * Footer — Site footer with engine links and legal info.
 * Server Component (no interactivity needed).
 */
import Link from 'next/link';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="border-t mt-auto"
      style={{ background: '#F5F5F5', borderColor: '#E0E0E0' }}
    >
      <div className="max-w-[1280px] mx-auto px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="font-bold text-xl mb-2" style={{ letterSpacing: '-0.02em' }}>
              <span style={{ color: '#0078D4' }}>MARKET</span>
              <span style={{ color: '#242424' }}>UP</span>
            </div>
            <p className="text-sm" style={{ color: '#616161', lineHeight: '1.6' }}>
              La plateforme nationale des entreprises tunisiennes.
            </p>
          </div>

          {/* Moteurs */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#616161' }}>
              Moteurs
            </h4>
            <ul className="space-y-2">
              {[
                { label: 'BrandUP', href: '/brandup' },
                { label: 'TraceUP', href: '/traceup' },
                { label: 'LinkUP',  href: '/linkup'  },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm hover:text-[#0078D4] transition-colors" style={{ color: '#616161' }}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Espace entreprise */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#616161' }}>
              Espace Entreprise
            </h4>
            <ul className="space-y-2">
              {[
                { label: 'Inscription',  href: '/signup'    },
                { label: 'Connexion',    href: '/signin'    },
                { label: 'Mon espace',   href: '/dashboard' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm hover:text-[#0078D4] transition-colors" style={{ color: '#616161' }}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#616161' }}>
              Contact
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="mailto:contact@vivasky.media" className="text-sm hover:text-[#0078D4] transition-colors" style={{ color: '#616161' }}>
                  contact@vivasky.media
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t flex flex-col md:flex-row items-center justify-between gap-3" style={{ borderColor: '#E0E0E0' }}>
          <p className="text-xs" style={{ color: '#616161' }}>
            © {year} AGGREGAX SUARL — Tous droits réservés
          </p>
          <p className="text-xs" style={{ color: '#616161' }}>
            Plateforme MARKET-UP by <a href="https://vivasky.media" className="hover:text-[#0078D4]">vivasky.media</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
