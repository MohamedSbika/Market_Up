/**
 * BoostTag — Orange "Boosté" badge shown on boosted profiles/cards.
 */
import { cn } from '@/lib/utils';

interface BoostTagProps {
  className?: string;
  small?: boolean;
}

export function BoostTag({ className, small = false }: BoostTagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-semibold',
        small ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
        className
      )}
      style={{
        background:   '#FFF7ED',
        color:        '#C2410C',
        border:       '1px solid #FED7AA',
        borderRadius: '4px',
      }}
    >
      {/* Lightning bolt */}
      <svg width={small ? 10 : 12} height={small ? 10 : 12} viewBox="0 0 24 24" fill="currentColor">
        <path d="M13 2L4.09 12.97H11L10 22L20.91 11.03H14L13 2Z"/>
      </svg>
      Boosté
    </span>
  );
}
