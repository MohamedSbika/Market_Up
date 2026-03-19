import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: '#F5F5F5' }}>
      <div className="text-center max-w-md px-6">
        <p className="text-8xl font-bold mb-4" style={{ color: '#0078D4', letterSpacing: '-0.04em' }}>404</p>
        <h1 className="text-2xl font-bold text-[#242424] mb-2" style={{ letterSpacing: '-0.02em' }}>
          Page introuvable
        </h1>
        <p className="text-sm text-[#616161] mb-8">
          La page que vous recherchez n&apos;existe pas ou a été déplacée.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="ms-btn-primary" style={{ padding: '10px 20px' }}>
            Accueil
          </Link>
          <Link href="/brandup" className="ms-btn-secondary" style={{ padding: '10px 20px' }}>
            Rechercher
          </Link>
        </div>
      </div>
    </div>
  );
}
