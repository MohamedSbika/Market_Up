/**
 * BrandUpProfile — Full institutional profile view.
 * isModal=true: compact version shown in CompanyModal (no full-page header).
 * Server Component friendly (no hooks at top level).
 */
import Image from 'next/image';
import Link from 'next/link';
import { CompanyInitials } from '@/components/shared/CompanyInitials';
import { RSEBadge } from '@/components/shared/RSEBadge';
import { BoostTag } from '@/components/shared/BoostTag';
import type { IBrandUpProfile, SafeCompany } from '@/types';

interface BrandUpProfileProps {
  company:  SafeCompany;
  profile:  IBrandUpProfile;
  rse?: {
    badgeActive: boolean;
    lastReceipts: Array<{ beneficiary: string; amount: number; validatedAt: string }>;
  };
  isModal?: boolean;
}

function InfoItem({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 text-sm text-[#616161]">
      <span className="mt-0.5 flex-shrink-0">{icon}</span>
      <span>{children}</span>
    </div>
  );
}

export function BrandUpProfile({ company, profile, rse, isModal = false }: BrandUpProfileProps) {
  const accent = '#0078D4';

  return (
    <div className={isModal ? '' : 'max-w-[900px] mx-auto px-4 py-8'}>
      {/* Header */}
      <div className="ms-card mb-4">
        <div className="flex items-start gap-4">
          <CompanyInitials name={company.name} logo={company.logo} size={isModal ? 'lg' : 'xl'} />

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className={`font-bold text-[#242424] ${isModal ? 'text-lg' : 'text-2xl'}`} style={{ letterSpacing: '-0.01em' }}>
                {company.name}
              </h1>
              {profile.isBoostActive && <BoostTag />}
              {rse?.badgeActive && <RSEBadge />}
            </div>

            <div className="flex flex-wrap gap-3">
              {profile.sector && (
                <span className="text-sm px-2 py-0.5 rounded font-medium" style={{ background: '#EFF6FC', color: accent }}>
                  {profile.sector}
                </span>
              )}
              <span className="text-sm px-2 py-0.5 rounded font-medium" style={{ background: '#F5F5F5', color: '#616161' }}>
                {company.type}
              </span>
            </div>

            {profile.shortDescription && (
              <p className="mt-2 text-sm text-[#616161]" style={{ lineHeight: '1.6' }}>
                {profile.shortDescription}
              </p>
            )}
          </div>

          {!isModal && (
            <div className="hidden md:flex items-center gap-1 text-sm text-[#616161]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
              {profile.viewCount.toLocaleString('fr-TN')} vues
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Main content */}
        <div className="md:col-span-2 space-y-4">
          {/* About */}
          {profile.about && (
            <div className="ms-card">
              <h2 className="font-semibold text-[15px] text-[#242424] mb-3" style={{ borderBottom: `2px solid ${accent}`, paddingBottom: '8px' }}>
                À propos
              </h2>
              <p className="text-sm text-[#616161] whitespace-pre-line" style={{ lineHeight: '1.7' }}>
                {profile.about}
              </p>
            </div>
          )}

          {/* Gallery */}
          {profile.gallery.length > 0 && (
            <div className="ms-card">
              <h2 className="font-semibold text-[15px] text-[#242424] mb-3" style={{ borderBottom: `2px solid ${accent}`, paddingBottom: '8px' }}>
                Galerie
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {profile.gallery.map((item, i) => (
                  <div key={i} className="relative aspect-video rounded overflow-hidden" style={{ border: '1px solid #E0E0E0' }}>
                    <Image
                      src={item.url}
                      alt={`${company.name} — photo ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, 33vw"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RSE Section */}
          {rse?.badgeActive && rse.lastReceipts.length > 0 && (
            <div className="ms-card" style={{ borderColor: '#C5A059' }}>
              <div className="flex items-center gap-2 mb-3">
                <RSEBadge />
                <h2 className="font-semibold text-[15px] text-[#242424]">Engagement RSE</h2>
              </div>
              <div className="space-y-2">
                {rse.lastReceipts.map((r, i) => (
                  <div key={i} className="flex items-center justify-between text-sm p-2 rounded" style={{ background: '#FEFCE8' }}>
                    <span className="text-[#242424]">{r.beneficiary}</span>
                    <span className="font-semibold" style={{ color: '#C5A059' }}>{r.amount.toLocaleString('fr-TN')} DT</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Info card */}
          <div className="ms-card space-y-3">
            <h2 className="font-semibold text-[15px] text-[#242424]">Informations</h2>

            {profile.city && (
              <InfoItem icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>}>
                {profile.city}
              </InfoItem>
            )}
            {profile.address && (
              <InfoItem icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>}>
                {profile.address}
              </InfoItem>
            )}
            {profile.phone && (
              <InfoItem icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.58 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>}>
                <a href={`tel:${profile.phone}`} className="hover:text-[#0078D4]">{profile.phone}</a>
              </InfoItem>
            )}
            {profile.email && (
              <InfoItem icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>}>
                <a href={`mailto:${profile.email}`} className="hover:text-[#0078D4]">{profile.email}</a>
              </InfoItem>
            )}
            {profile.foundedYear && (
              <InfoItem icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}>
                Fondée en {profile.foundedYear}
              </InfoItem>
            )}
            {profile.employeesCount && (
              <InfoItem icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}>
                {profile.employeesCount.toLocaleString('fr-TN')} employés
              </InfoItem>
            )}
          </div>

          {/* Open full page CTA (modal only) */}
          {isModal && (
            <Link
              href={`/brandup/${company.slug}`}
              className="ms-btn-secondary w-full justify-center"
              style={{ display: 'flex' }}
            >
              Voir le profil complet
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-1">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
