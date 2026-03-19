import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F5F5F5' }}>
      {/* Simple header */}
      <header className="border-b" style={{ background: '#FFFFFF', borderColor: '#E0E0E0' }}>
        <div className="max-w-[1280px] mx-auto px-6 h-14 flex items-center">
          <Link href="/" className="font-bold text-xl" style={{ letterSpacing: '-0.02em' }}>
            <span style={{ color: '#0078D4' }}>MARKET</span>
            <span style={{ color: '#242424' }}>UP</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        {children}
      </main>

      <footer className="text-center py-4 text-xs text-[#616161]">
        © {new Date().getFullYear()} AGGREGAX SUARL
      </footer>
    </div>
  );
}
