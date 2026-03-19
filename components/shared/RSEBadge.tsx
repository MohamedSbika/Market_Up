/**
 * RSEBadge — Gold RSE certification badge displayed on profiles and cards.
 * Two variants: 'full' (with label) and 'icon' (small dot-style).
 */
import { cn } from '@/lib/utils';

interface RSEBadgeProps {
  variant?: 'full' | 'icon';
  className?: string;
}

export function RSEBadge({ variant = 'full', className }: RSEBadgeProps) {
  if (variant === 'icon') {
    return (
      <span
        title="RSE Certifiée"
        className={cn(
          'inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold',
          className
        )}
        style={{ background: '#C5A059', color: '#FFFFFF' }}
        aria-label="RSE Certifiée"
      >
        R
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold',
        className
      )}
      style={{
        background:   '#FEFCE8',
        color:        '#C5A059',
        border:       '1px solid #FDE68A',
        borderRadius: '4px',
      }}
    >
      {/* Medal icon */}
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="7"/>
        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
      </svg>
      RSE Certifiée
    </span>
  );
}
