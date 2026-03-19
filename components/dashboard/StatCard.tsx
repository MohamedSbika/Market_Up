/**
 * StatCard — KPI card used on the dashboard overview.
 * Shows a metric with optional delta indicator.
 */
import { cn } from '@/lib/utils';

interface StatCardProps {
  title:    string;
  value:    string | number;
  delta?:   number;
  icon:     React.ReactNode;
  accent?:  string;
  className?: string;
}

export function StatCard({ title, value, delta, icon, accent = '#0078D4', className }: StatCardProps) {
  const deltaPositive = delta !== undefined && delta >= 0;

  return (
    <div
      className={cn('ms-card flex items-start gap-4', className)}
      style={{ borderLeft: `3px solid ${accent}` }}
    >
      <div
        className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0"
        style={{ background: `${accent}15`, color: accent }}
      >
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#616161' }}>
          {title}
        </p>
        <p className="text-2xl font-bold text-[#242424]" style={{ letterSpacing: '-0.02em' }}>
          {typeof value === 'number' ? value.toLocaleString('fr-TN') : value}
        </p>
        {delta !== undefined && (
          <p className={`text-xs mt-1 font-medium ${deltaPositive ? 'text-[#107C10]' : 'text-[#D13438]'}`}>
            {deltaPositive ? '↑' : '↓'} {Math.abs(delta).toLocaleString('fr-TN')} ce mois
          </p>
        )}
      </div>
    </div>
  );
}
