'use client';

import { useState, useCallback } from 'react';
import { SearchBar }        from '@/components/search/SearchBar';
import { FilterPanel }      from '@/components/search/FilterPanel';
import { CompanyGrid }      from '@/components/search/CompanyGrid';
import { CompanyModal }     from '@/components/search/CompanyModal';
import { SponsoringBanner } from '@/components/search/SponsoringBanner';
import { Pagination }       from '@/components/search/Pagination';
import { useSearchEngine }  from '@/app/(public)/hooks/useSearchEngine';
import type { SearchCompanyItem } from '@/types';

export function LinkUpSearchPage() {
  const {
    companies, total, page, totalPages, isLoading, sponsor,
    query, sector, city, market,
    setQuery, setSector, setCity, setMarket, setPage,
  } = useSearchEngine('linkup');

  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const handleCardClick = useCallback((c: SearchCompanyItem) => setSelectedCompany(c.slug), []);

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-6 rounded" style={{ background: '#000000' }} />
          <h1 className="text-2xl font-bold text-[#242424]" style={{ letterSpacing: '-0.01em' }}>LinkUP</h1>
        </div>
        <p className="text-sm text-[#616161]">Cartes de contact digitales des entreprises tunisiennes</p>
      </div>

      {sponsor && <SponsoringBanner sponsor={sponsor} className="mb-6" />}

      <div className="mb-6 space-y-3">
        <SearchBar onSearch={setQuery} defaultValue={query} placeholder="Rechercher une entreprise…" className="max-w-lg" />
        <FilterPanel sector={sector} city={city} market={market} onSector={setSector} onCity={setCity} onMarket={setMarket} />
      </div>

      <CompanyGrid companies={companies} profileType="linkup" onCardClick={handleCardClick} isLoading={isLoading} total={total} />
      <Pagination page={page} totalPages={totalPages} onPage={setPage} />

      <CompanyModal slug={selectedCompany} profileType="linkup" onClose={() => setSelectedCompany(null)} />
    </div>
  );
}
