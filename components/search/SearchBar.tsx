'use client';

/**
 * SearchBar — Text input with debounced query + optional B2B/B2C filter.
 * Calls onSearch when value changes (debounced 300ms).
 */
import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  defaultValue?: string;
  className?: string;
}

export function SearchBar({ placeholder = 'Rechercher une entreprise…', onSearch, defaultValue = '', className }: SearchBarProps) {
  const [value, setValue] = useState(defaultValue);
  const debounced = useDebounce(value, 300);

  useEffect(() => {
    onSearch(debounced);
  }, [debounced, onSearch]);

  return (
    <div className={cn('relative', className)}>
      {/* Search icon */}
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#616161" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
      </div>

      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="ms-input pl-9 pr-4"
        style={{ height: '42px' }}
        aria-label={placeholder}
      />

      {/* Clear button */}
      {value && (
        <button
          onClick={() => setValue('')}
          className="absolute inset-y-0 right-3 flex items-center text-[#616161] hover:text-[#242424]"
          aria-label="Clear search"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      )}
    </div>
  );
}
