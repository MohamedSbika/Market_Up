'use client';

/**
 * NotificationItem — Renders a single notification with icon, message, and time.
 */
import { timeAgo } from '@/lib/utils';
import type { INotification, NotificationType } from '@/types';

interface NotificationItemProps {
  notification: INotification;
  onMarkRead:   (id: string) => void;
}

// Icon SVG path data per type (rendered inside a <svg> wrapper)
const typeConfig: Record<NotificationType, { label: string; color: string; paths: React.ReactNode }> = {
  account_approved: {
    label: 'Compte activé', color: '#107C10',
    paths: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>,
  },
  profile_validated: {
    label: 'Profil validé', color: '#107C10',
    paths: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>,
  },
  profile_rejected: {
    label: 'Profil refusé', color: '#D13438',
    paths: <><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></>,
  },
  account_suspended: {
    label: 'Compte suspendu', color: '#D13438',
    paths: <><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></>,
  },
  rse_validated: {
    label: 'Don RSE validé', color: '#C5A059',
    paths: <><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></>,
  },
  rse_rejected: {
    label: 'Don RSE refusé', color: '#D13438',
    paths: <><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></>,
  },
  boost_activated: {
    label: 'Boost activé', color: '#C2410C',
    paths: <path d="M13 2L4.09 12.97H11L10 22L20.91 11.03H14L13 2Z" fill="#C2410C"/>,
  },
  boost_expiring_soon: {
    label: 'Boost expire bientôt', color: '#D97706',
    paths: <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>,
  },
  sponsoring_approved: {
    label: 'Sponsoring approuvé', color: '#107C10',
    paths: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>,
  },
  sponsoring_rejected: {
    label: 'Sponsoring refusé', color: '#D13438',
    paths: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>,
  },
};

function getNotificationMessage(type: NotificationType, data?: Record<string, unknown>): string {
  const pt = data?.profileType ? ` (${String(data.profileType).toUpperCase()})` : '';
  const msgs: Record<NotificationType, string> = {
    account_approved:    'Votre compte a été activé. Vous pouvez maintenant compléter vos profils.',
    profile_validated:   `Votre profil${pt} est maintenant en ligne.`,
    profile_rejected:    `Votre profil${pt} a été refusé.${data?.reason ? ` Motif: ${String(data.reason)}` : ''}`,
    account_suspended:   `Votre compte a été suspendu.${data?.reason ? ` Motif: ${String(data.reason)}` : ''}`,
    rse_validated:       'Votre don RSE a été validé. Votre badge RSE est actif.',
    rse_rejected:        `Votre don RSE a été refusé.${data?.reason ? ` Motif: ${String(data.reason)}` : ''}`,
    boost_activated:     `Votre Boost${pt} est maintenant actif !`,
    boost_expiring_soon: `Votre Boost${pt} expire dans ${data?.daysLeft ?? '?'} jours.`,
    sponsoring_approved: 'Votre campagne de sponsoring a été approuvée.',
    sponsoring_rejected: `Votre campagne a été refusée.${data?.reason ? ` Motif: ${String(data.reason)}` : ''}`,
  };
  return msgs[type] ?? 'Nouvelle notification.';
}

export function NotificationItem({ notification, onMarkRead }: NotificationItemProps) {
  const cfg = typeConfig[notification.type];
  if (!cfg) return null;

  const handleClick = () => {
    if (!notification.isRead) {
      fetch(`/api/dashboard/notifications/${notification._id}/read`, { method: 'PATCH' })
        .catch(() => null);
      onMarkRead(notification._id);
    }
  };

  return (
    <div
      className="flex items-start gap-3 p-4 cursor-pointer hover:bg-[#FAFAFA] transition-colors"
      style={{ background: notification.isRead ? undefined : '#EFF6FC' }}
      onClick={handleClick}
    >
      {/* Icon */}
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${cfg.color}18` }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={cfg.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {cfg.paths}
        </svg>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: cfg.color }}>
            {cfg.label}
          </p>
          <span className="text-[11px] flex-shrink-0 text-[#A0A0A0]">
            {timeAgo(new Date(notification.createdAt))}
          </span>
        </div>
        <p className="text-sm text-[#242424] mt-0.5" style={{ lineHeight: '1.5' }}>
          {getNotificationMessage(notification.type, notification.data)}
        </p>
      </div>

      {/* Unread dot */}
      {!notification.isRead && (
        <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: '#0078D4' }} />
      )}
    </div>
  );
}
