/**
 * CompanyGrid — Responsive 3-column grid of CompanyCard components.
 * Shows skeleton loading states when isLoading=true.
 */
'use client';

import { CompanyCard } from '@/components/search/CompanyCard';
import type { SearchCompanyItem, ProfileType } from '@/types';

interface CompanyGridProps {
  companies:   SearchCompanyItem[];
  profileType: ProfileType;
  onCardClick: (company: SearchCompanyItem) => void;
  isLoading?:  boolean;
  total?:      number;
}

function SkeletonCard() {
  return (
    <div className="ms-card animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-14 h-14 rounded bg-[#F5F5F5] flex-shrink-0" />
        <div className="flex-1">
          <div className="h-4 bg-[#F5F5F5] rounded w-3/4 mb-2" />
          <div className="h-3 bg-[#F5F5F5] rounded w-1/2" />
        </div>
      </div>
      <div className="mt-3 space-y-2">
        <div className="h-3 bg-[#F5F5F5] rounded" />
        <div className="h-3 bg-[#F5F5F5] rounded w-5/6" />
      </div>
    </div>
  );
}

export function CompanyGrid({
  companies,
  profileType,
  onCardClick,
  isLoading = false,
  total,
}: CompanyGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 15 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (!isLoading && companies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D1D1D1" strokeWidth="1.5" className="mb-4">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
        <h3 className="font-semibold text-[#242424] mb-1">Aucun résultat</h3>
        <p className="text-sm text-[#616161]">Essayez de modifier vos critères de recherche.</p>
      </div>
    );
  }

  return (
    <div>
      {total !== undefined && (
        <p className="text-sm text-[#616161] mb-4">
          <span className="font-medium text-[#242424]">{total.toLocaleString('fr-TN')}</span> entreprise{total !== 1 ? 's' : ''} trouvée{total !== 1 ? 's' : ''}
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {companies.map((company) => (
          <CompanyCard
            key={company._id}
            company={company}
            profileType={profileType}
            onClick={onCardClick}
          />
        ))}
      </div>
    </div>
  );
}
