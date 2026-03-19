/**
 * ProfileStatusCard — Shows a profile's status on the dashboard overview.
 * Provides a quick link to edit the profile and boost it.
 */
import Link from 'next/link';
import type { ProfileStatus, ProfileType } from '@/types';

interface ProfileStatusCardProps {
  profileType: ProfileType;
  status:      ProfileStatus | null;
  viewCount:   number;
  onBoost?:    () => void;
}

const profileConfig = {
  brandup: { label: 'BrandUP', accent: '#0078D4', href: '/dashboard/brandup' },
  traceup: { label: 'TraceUP', accent: '#8764B8', href: '/dashboard/traceup' },
  linkup:  { label: 'LinkUP',  accent: '#C5A059', href: '/dashboard/linkup'  },
};

const statusConfig: Record<string, { label: string; bg: string; color: string; border: string }> = {
  active:   { label: 'En ligne',  bg: '#F0FDF4', color: '#107C10', border: '#B7EBC0' },
  pending:  { label: 'En révision', bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' },
  disabled: { label: 'Désactivé', bg: '#F5F5F5', color: '#616161', border: '#E0E0E0' },
};

export function ProfileStatusCard({ profileType, status, viewCount, onBoost }: ProfileStatusCardProps) {
  const cfg    = profileConfig[profileType];
  const sCfg   = status ? statusConfig[status] ?? statusConfig.disabled : statusConfig.disabled;

  return (
    <div
      className="ms-card"
      style={{ borderTop: `3px solid ${cfg.accent}` }}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="font-semibold text-[15px] text-[#242424]">{cfg.label}</span>
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded"
          style={{ background: sCfg.bg, color: sCfg.color, border: `1px solid ${sCfg.border}` }}
        >
          {sCfg.label}
        </span>
      </div>

      <p className="text-sm text-[#616161] mb-4">
        <span className="font-medium text-[#242424]">{viewCount.toLocaleString('fr-TN')}</span> vues
      </p>

      <div className="flex gap-2">
        <Link
          href={cfg.href}
          className="flex-1 py-1.5 text-center rounded text-sm font-medium transition-colors"
          style={{ background: '#F5F5F5', color: '#242424', border: '1px solid #E0E0E0' }}
        >
          Modifier
        </Link>
        {onBoost && status === 'active' && (
          <button
            onClick={onBoost}
            className="flex-1 py-1.5 rounded text-sm font-semibold text-white transition-colors"
            style={{ background: cfg.accent }}
          >
            Booster
          </button>
        )}
      </div>
    </div>
  );
}
