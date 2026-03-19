'use client';

/**
 * BrandUP search engine client page.
 * Uses neutral Tailwind grays — search accent color not yet validated by client.
 */
import { useState, useCallback } from 'react';
import { SearchBar }      from '@/components/search/SearchBar';
import { FilterPanel }    from '@/components/search/FilterPanel';
import { CompanyGrid }    from '@/components/search/CompanyGrid';
import { CompanyModal }   from '@/components/search/CompanyModal';
import { SponsoringBanner } from '@/components/search/SponsoringBanner';
import { Pagination }     from '@/components/search/Pagination';
import { useSearchEngine } from '@/app/(public)/hooks/useSearchEngine';
import type { SearchCompanyItem } from '@/types';

export function BrandUpSearchPage() {
  const {
    companies, total, page, totalPages, isLoading, sponsor,
    query, sector, city, market,
    setQuery, setSector, setCity, setMarket, setPage,
  } = useSearchEngine('brandup');

  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

  const handleCardClick = useCallback((company: SearchCompanyItem) => {
    setSelectedCompany(company.slug);
  }, []);

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6">
      {/* Page header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-6 rounded" style={{ background: '#0078D4' }} />
          <h1 className="text-2xl font-bold text-[#242424]" style={{ letterSpacing: '-0.01em' }}>BrandUP</h1>
        </div>
        <p className="text-sm text-[#616161]">Profils institutionnels des entreprises tunisiennes</p>
      </div>

      {/* Sponsoring banner */}
      {sponsor && (
        <SponsoringBanner
          sponsor={sponsor}
          className="mb-6"
        />
      )}

      {/* Search + Filters */}
      <div className="mb-6 space-y-3">
        <SearchBar
          onSearch={setQuery}
          defaultValue={query}
          placeholder="Rechercher par nom, secteur…"
          className="max-w-lg"
        />
        <FilterPanel
          sector={sector}
          city={city}
          market={market}
          onSector={setSector}
          onCity={setCity}
          onMarket={setMarket}
        />
      </div>

      {/* Results */}
      <CompanyGrid
        companies={companies}
        profileType="brandup"
        onCardClick={handleCardClick}
        isLoading={isLoading}
        total={total}
      />

      <Pagination page={page} totalPages={totalPages} onPage={setPage} />

      {/* Modal */}
      <CompanyModal
        slug={selectedCompany}
        profileType="brandup"
        onClose={() => setSelectedCompany(null)}
      />
    </div>
  );
}
