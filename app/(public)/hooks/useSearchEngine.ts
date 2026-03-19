'use client';

/**
 * useSearchEngine — Shared data fetching hook for all 3 search engines.
 * Manages query, filters, pagination, and debounced API calls.
 */
import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import type { SearchCompanyItem, ISponsoring, ProfileType } from '@/types';

interface SearchState {
  companies:   SearchCompanyItem[];
  total:       number;
  page:        number;
  totalPages:  number;
  isLoading:   boolean;
  sponsor:     ISponsoring | null;
  query:       string;
  sector:      string;
  city:        string;
  market:      '' | 'B2B' | 'B2C';
  setQuery:    (v: string) => void;
  setSector:   (v: string) => void;
  setCity:     (v: string) => void;
  setMarket:   (v: '' | 'B2B' | 'B2C') => void;
  setPage:     (v: number) => void;
}

interface APIResponse {
  companies:  SearchCompanyItem[];
  total:      number;
  page:       number;
  totalPages: number;
  sponsor:    ISponsoring | null;
}

export function useSearchEngine(profileType: ProfileType): SearchState {
  const [query,   setQuery]   = useState('');
  const [sector,  setSector]  = useState('');
  const [city,    setCity]    = useState('');
  const [market,  setMarket]  = useState<'' | 'B2B' | 'B2C'>('');
  const [page,    setPage]    = useState(1);

  const [companies,  setCompanies]  = useState<SearchCompanyItem[]>([]);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading,  setIsLoading]  = useState(false);
  const [sponsor,    setSponsor]    = useState<ISponsoring | null>(null);

  const debouncedQuery = useDebounce(query, 300);

  // Reset to page 1 when filters change
  const handleSetQuery  = useCallback((v: string) => { setQuery(v);   setPage(1); }, []);
  const handleSetSector = useCallback((v: string) => { setSector(v);  setPage(1); }, []);
  const handleSetCity   = useCallback((v: string) => { setCity(v);    setPage(1); }, []);
  const handleSetMarket = useCallback((v: '' | 'B2B' | 'B2C') => { setMarket(v); setPage(1); }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('type', profileType);
    params.set('page', String(page));
    if (debouncedQuery) params.set('q',      debouncedQuery);
    if (sector)         params.set('sector', sector);
    if (city)           params.set('city',   city);
    if (market)         params.set('market', market);

    let cancelled = false;
    setIsLoading(true);

    fetch(`/api/companies?${params.toString()}`)
      .then((r) => r.json() as Promise<APIResponse>)
      .then((data) => {
        if (cancelled) return;
        setCompanies(data.companies ?? []);
        setTotal(data.total ?? 0);
        setTotalPages(data.totalPages ?? 0);
        setSponsor(data.sponsor ?? null);
      })
      .catch(() => {
        if (!cancelled) setCompanies([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [debouncedQuery, sector, city, market, page, profileType]);

  return {
    companies, total, page, totalPages, isLoading, sponsor,
    query, sector, city, market,
    setQuery:  handleSetQuery,
    setSector: handleSetSector,
    setCity:   handleSetCity,
    setMarket: handleSetMarket,
    setPage,
  };
}
