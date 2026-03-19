/**
 * LinkUpProfile — Contact card profile view.
 * LinkUP accent: Black + Gold (#000 / #C5A059)
 * isModal=true: compact inline version.
 */
'use client';

import Link from 'next/link';
import { CompanyInitials } from '@/components/shared/CompanyInitials';
import { RSEBadge } from '@/components/shared/RSEBadge';
import { BoostTag } from '@/components/shared/BoostTag';
import type { ILinkUpProfile, SafeCompany } from '@/types';

interface LinkUpProfileProps {
  company:  SafeCompany;
  profile:  ILinkUpProfile;
  rse?: { badgeActive: boolean };
  isModal?: boolean;
}

const GOLD = '#C5A059';

interface ContactLinkProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  external?: boolean;
}

function ContactLink({ href, label, icon, external = false }: ContactLinkProps) {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="flex items-center gap-3 p-3 rounded-lg border transition-all hover:-translate-y-0.5"
      style={{
        border:           `1px solid #E0E0E0`,
        background:       '#FFFFFF',
        color:            '#242424',
        boxShadow:        '0 2px 4px rgba(0,0,0,0.06)',
        textDecoration:   'none',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = GOLD;
        (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 12px rgba(197,160,89,0.15)`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = '#E0E0E0';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 4px rgba(0,0,0,0.06)';
      }}
    >
      <span style={{ color: GOLD }}>{icon}</span>
      <span className="text-sm font-medium">{label}</span>
      <svg className="ml-auto" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D1D1D1" strokeWidth="2">
        <path d="M9 18l6-6-6-6"/>
      </svg>
    </a>
  );
}

export function LinkUpProfile({ company, profile, rse, isModal = false }: LinkUpProfileProps) {
  return (
    <div className={isModal ? '' : 'max-w-[600px] mx-auto px-4 py-8'}>
      {/* Header — gold accent bar */}
      <div className="ms-card mb-4 overflow-hidden" style={{ padding: 0 }}>
        <div style={{ height: '6px', background: `linear-gradient(90deg, #000000, ${GOLD})` }} />
        <div className="p-6 flex flex-col items-center text-center gap-3">
          <CompanyInitials name={company.name} logo={company.logo} size="xl" />
          <div>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <h1 className={`font-bold text-[#242424] ${isModal ? 'text-lg' : 'text-2xl'}`} style={{ letterSpacing: '-0.01em' }}>
                {company.name}
              </h1>
              {profile.isBoostActive && <BoostTag />}
              {rse?.badgeActive && <RSEBadge variant="icon" />}
            </div>
            <span className="text-sm px-2 py-0.5 rounded font-medium mt-1 inline-block" style={{ background: '#F5F5F5', color: '#616161' }}>
              {company.type}
            </span>
          </div>
          {!isModal && (
            <p className="text-xs text-[#616161]">
              {profile.viewCount.toLocaleString('fr-TN')} vues
            </p>
          )}
        </div>
      </div>

      {/* Contact links */}
      <div className="ms-card space-y-2">
        <h2 className="font-semibold text-sm text-[#616161] uppercase tracking-wider mb-3">
          Nous contacter
        </h2>

        {profile.whatsapp && (
          <ContactLink
            href={`https://wa.me/${profile.whatsapp.replace(/\D/g, '')}`}
            label="WhatsApp"
            external
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>}
          />
        )}

        {profile.gpsUrl && (
          <ContactLink
            href={profile.gpsUrl}
            label="Localisation GPS"
            external
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>}
          />
        )}

        {profile.website && (
          <ContactLink href={profile.website} label="Site web" external
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>}
          />
        )}

        {profile.linkedin && (
          <ContactLink href={profile.linkedin} label="LinkedIn" external
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>}
          />
        )}

        {profile.facebook && (
          <ContactLink href={profile.facebook} label="Facebook" external
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>}
          />
        )}

        {profile.instagram && (
          <ContactLink href={profile.instagram} label="Instagram" external
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>}
          />
        )}

        {profile.youtube && (
          <ContactLink href={profile.youtube} label="YouTube" external
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-1.96C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.4 19.54C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white"/></svg>}
          />
        )}
      </div>

      {isModal && (
        <div className="mt-4">
          <Link
            href={`/linkup/${company.slug}`}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded font-semibold text-sm transition-colors"
            style={{ background: '#000000', color: GOLD }}
          >
            Voir le profil complet
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
}
