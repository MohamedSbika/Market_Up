'use client';

/**
 * Pagination — Page navigation for search results.
 * Fluent Design style — no full/rounded buttons.
 */
import { cn } from '@/lib/utils';

interface PaginationProps {
  page:       number;
  totalPages: number;
  onPage:     (page: number) => void;
}

export function Pagination({ page, totalPages, onPage }: PaginationProps) {
  if (totalPages <= 1) return null;

  // Build page number array with ellipsis
  const pages: (number | '…')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3)          pages.push('…');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push('…');
    pages.push(totalPages);
  }

  return (
    <nav className="flex items-center justify-center gap-1 mt-8" aria-label="Pagination">
      {/* Previous */}
      <button
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
        className={cn(
          'w-9 h-9 rounded flex items-center justify-center text-sm transition-colors',
          page === 1
            ? 'text-[#D1D1D1] cursor-not-allowed'
            : 'text-[#616161] hover:bg-[#F5F5F5] hover:text-[#242424]'
        )}
        aria-label="Page précédente"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>

      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-sm text-[#616161]">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPage(p as number)}
            className={cn(
              'w-9 h-9 rounded flex items-center justify-center text-sm font-medium transition-colors',
              page === p
                ? 'text-white'
                : 'text-[#616161] hover:bg-[#F5F5F5] hover:text-[#242424]'
            )}
            style={page === p ? { background: '#0078D4' } : {}}
            aria-label={`Page ${p}`}
            aria-current={page === p ? 'page' : undefined}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => onPage(page + 1)}
        disabled={page === totalPages}
        className={cn(
          'w-9 h-9 rounded flex items-center justify-center text-sm transition-colors',
          page === totalPages
            ? 'text-[#D1D1D1] cursor-not-allowed'
            : 'text-[#616161] hover:bg-[#F5F5F5] hover:text-[#242424]'
        )}
        aria-label="Page suivante"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </button>
    </nav>
  );
}
