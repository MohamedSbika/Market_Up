import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { BrandUpProfile } from '@/models/BrandUpProfile';
import { TraceUpProfile } from '@/models/TraceUpProfile';
import { LinkUpProfile } from '@/models/LinkUpProfile';
import { Notification } from '@/models/Notification';
import { StatCard } from '@/components/dashboard/StatCard';
import { ProfileStatusCard } from '@/components/dashboard/ProfileStatusCard';
import Link from 'next/link';
import type { IBrandUpProfile, ITraceUpProfile, ILinkUpProfile } from '@/types';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await auth();
  if (!session) return null;

  const companyId = session.user.id;

  await connectDB();

  const [brandUp, traceUp, linkUp, unreadCount] = await Promise.all([
    BrandUpProfile.findOne({ companyId }).lean<IBrandUpProfile>(),
    TraceUpProfile.findOne({ companyId }).lean<ITraceUpProfile>(),
    LinkUpProfile.findOne({ companyId }).lean<ILinkUpProfile>(),
    Notification.countDocuments({ companyId, isRead: false }),
  ]);

  const totalViews =
    (brandUp?.viewCount ?? 0) +
    (traceUp?.viewCount ?? 0) +
    (linkUp?.viewCount  ?? 0);

  const activeProfiles = [brandUp, traceUp, linkUp].filter((p) => p?.status === 'active').length;

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold text-[#242424]" style={{ letterSpacing: '-0.02em' }}>
          Bonjour, {session.user.name} 👋
        </h1>
        <p className="text-sm text-[#616161] mt-1">
          Vue d&apos;ensemble de votre présence sur MARKET-UP.
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Vues totales"
          value={totalViews}
          accent="#0078D4"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          }
        />
        <StatCard
          title="Profils actifs"
          value={`${activeProfiles} / 3`}
          accent="#107C10"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          }
        />
        <StatCard
          title="Notifications"
          value={unreadCount}
          accent="#CA5010"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round"/>
              <path d="M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round"/>
            </svg>
          }
        />
        <StatCard
          title="Moteurs en ligne"
          value={activeProfiles}
          accent="#8764B8"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35" strokeLinecap="round"/>
            </svg>
          }
        />
      </div>

      {/* Profile status cards */}
      <div>
        <h2 className="text-base font-semibold text-[#242424] mb-3">Vos profils</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ProfileStatusCard
            profileType="brandup"
            status={brandUp?.status ?? null}
            viewCount={brandUp?.viewCount ?? 0}
          />
          <ProfileStatusCard
            profileType="traceup"
            status={traceUp?.status ?? null}
            viewCount={traceUp?.viewCount ?? 0}
          />
          <ProfileStatusCard
            profileType="linkup"
            status={linkUp?.status ?? null}
            viewCount={linkUp?.viewCount ?? 0}
          />
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-base font-semibold text-[#242424] mb-3">Actions rapides</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Booster un profil',  href: '/dashboard/boost',         color: '#CA5010' },
            { label: 'Badge RSE',          href: '/dashboard/rse',            color: '#107C10' },
            { label: 'Sponsoring',         href: '/dashboard/sponsoring',     color: '#8764B8' },
            { label: 'Facturation',        href: '/dashboard/billing',        color: '#0078D4' },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="ms-card flex items-center gap-3 p-4 hover:shadow-md transition-shadow"
              style={{ borderLeft: `3px solid ${action.color}` }}
            >
              <span className="text-sm font-medium text-[#242424]">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
