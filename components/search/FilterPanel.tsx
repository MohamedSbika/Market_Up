'use client';

/**
 * FilterPanel — Sector, city, and B2B/B2C filters for search engines.
 */
import { cn } from '@/lib/utils';

interface FilterPanelProps {
  sector:    string;
  city:      string;
  market:    '' | 'B2B' | 'B2C';
  onSector:  (v: string) => void;
  onCity:    (v: string) => void;
  onMarket:  (v: '' | 'B2B' | 'B2C') => void;
  className?: string;
}

const SECTORS = [
  'Agriculture', 'Agroalimentaire', 'Automobile', 'BTP',
  'Commerce', 'Education', 'Energie', 'Finance',
  'Immobilier', 'Industrie', 'IT & Technologie', 'Logistique',
  'Santé', 'Services', 'Tourisme', 'Textile',
];

export function FilterPanel({ sector, city, market, onSector, onCity, onMarket, className }: FilterPanelProps) {
  return (
    <div className={cn('flex flex-wrap gap-3 items-center', className)}>
      {/* Market type pills */}
      <div className="flex gap-1">
        {(['', 'B2B', 'B2C'] as const).map((m) => (
          <button
            key={m || 'all'}
            onClick={() => onMarket(m)}
            className={cn(
              'px-3 py-1 rounded text-sm font-medium transition-colors',
              market === m
                ? 'text-white'
                : 'text-[#616161] hover:text-[#242424] hover:bg-[#F5F5F5]'
            )}
            style={market === m ? { background: '#0078D4' } : { background: 'transparent', border: '1px solid #E0E0E0' }}
          >
            {m || 'Tous'}
          </button>
        ))}
      </div>

      {/* Sector select */}
      <select
        value={sector}
        onChange={(e) => onSector(e.target.value)}
        className="ms-input"
        style={{ width: 'auto', minWidth: '160px', height: '36px', padding: '4px 10px' }}
        aria-label="Filter by sector"
      >
        <option value="">Tous les secteurs</option>
        {SECTORS.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      {/* City input */}
      <input
        type="text"
        value={city}
        onChange={(e) => onCity(e.target.value)}
        placeholder="Ville…"
        className="ms-input"
        style={{ width: 'auto', minWidth: '120px', height: '36px' }}
        aria-label="Filter by city"
      />

      {/* Clear filters */}
      {(sector || city || market) && (
        <button
          onClick={() => { onSector(''); onCity(''); onMarket(''); }}
          className="text-xs text-[#0078D4] hover:text-[#106EBE] underline"
        >
          Effacer les filtres
        </button>
      )}
    </div>
  );
}
