'use client';

/**
 * CompanyCard — Card shown in the search engine grid.
 * Neutral colors (search page accent not yet validated by client).
 * Click opens CompanyModal with URL update.
 */
import { CompanyInitials } from '@/components/shared/CompanyInitials';
import { RSEBadge } from '@/components/shared/RSEBadge';
import { BoostTag } from '@/components/shared/BoostTag';
import type { SearchCompanyItem, ProfileType } from '@/types';
import { cn } from '@/lib/utils';

interface CompanyCardProps {
  company:     SearchCompanyItem;
  profileType: ProfileType;
  onClick:     (company: SearchCompanyItem) => void;
}

export function CompanyCard({ company, profileType, onClick }: CompanyCardProps) {
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onClick(company)}
      onKeyDown={(e) => e.key === 'Enter' && onClick(company)}
      className={cn(
        'ms-card cursor-pointer select-none',
        'flex flex-col gap-3 relative'
      )}
      aria-label={`Voir le profil de ${company.name}`}
    >
      {/* Boost badge — top-right */}
      {company.isBoostActive && (
        <div className="absolute top-3 right-3">
          <BoostTag small />
        </div>
      )}

      {/* Header row */}
      <div className="flex items-start gap-3">
        <CompanyInitials name={company.name} logo={company.logo} size="lg" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[15px] text-[#242424] truncate pr-12" style={{ letterSpacing: '-0.01em' }}>
            {company.name}
          </h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs px-1.5 py-0.5 rounded font-medium" style={{ background: '#F5F5F5', color: '#616161' }}>
              {company.type}
            </span>
            {company.sector && (
              <span className="text-xs text-[#616161] truncate">{company.sector}</span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {company.shortDescription && (
        <p className="text-sm text-[#616161] line-clamp-2" style={{ lineHeight: '1.5' }}>
          {company.shortDescription}
        </p>
      )}

      {/* Footer row */}
      <div className="flex items-center justify-between mt-auto pt-1">
        <div className="flex items-center gap-2">
          {company.city && (
            <span className="flex items-center gap-1 text-xs text-[#616161]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              {company.city}
            </span>
          )}
          {company.rseActive && <RSEBadge variant="icon" />}
        </div>

        <span className="flex items-center gap-1 text-xs text-[#616161]">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          {company.viewCount.toLocaleString('fr-TN')}
        </span>
      </div>
    </article>
  );
}
