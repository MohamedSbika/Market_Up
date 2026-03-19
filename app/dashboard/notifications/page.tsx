'use client';

import { useState, useEffect, useCallback } from 'react';
import { NotificationItem } from '@/components/dashboard/NotificationItem';
import type { INotification } from '@/types';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [isLoading,     setIsLoading]     = useState(true);
  const [isMarkingAll,  setIsMarkingAll]  = useState(false);
  const [page,          setPage]          = useState(1);
  const [total,         setTotal]         = useState(0);

  const LIMIT = 20;

  const fetchNotifications = useCallback(async (p: number) => {
    setIsLoading(true);
    try {
      const res  = await fetch(`/api/dashboard/notifications?page=${p}&limit=${LIMIT}`);
      const json = await res.json();
      if (res.ok) {
        setNotifications(json.notifications ?? []);
        setTotal(json.total ?? 0);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(page); }, [page, fetchNotifications]);

  const handleMarkRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => n._id === id ? { ...n, isRead: true } : n)
    );
  };

  const handleMarkAll = async () => {
    setIsMarkingAll(true);
    try {
      await fetch('/api/dashboard/notifications/read-all', { method: 'PATCH' });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } finally {
      setIsMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const totalPages  = Math.ceil(total / LIMIT);

  return (
    <div className="max-w-[700px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#242424]" style={{ letterSpacing: '-0.02em' }}>
            Notifications
          </h1>
          <p className="text-sm text-[#616161] mt-1">
            {unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}` : 'Tout est lu.'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAll}
            disabled={isMarkingAll}
            className="ms-btn-secondary disabled:opacity-60 text-sm"
            style={{ padding: '8px 16px' }}
          >
            {isMarkingAll ? 'En cours…' : 'Tout marquer comme lu'}
          </button>
        )}
      </div>

      <div className="ms-card overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-[#E0E0E0]">
            {[1,2,3,4,5].map((i) => (
              <div key={i} className="p-4 flex items-start gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-[#E0E0E0]" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-[#E0E0E0] rounded w-3/4" />
                  <div className="h-3 bg-[#E0E0E0] rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-[#616161] text-sm">Aucune notification.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#E0E0E0]">
            {notifications.map((notif) => (
              <NotificationItem
                key={notif._id}
                notification={notif}
                onMarkRead={handleMarkRead}
              />
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#616161]">{total} notification{total > 1 ? 's' : ''}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="ms-btn-secondary disabled:opacity-40"
              style={{ padding: '6px 14px', fontSize: '13px' }}
            >
              ← Précédent
            </button>
            <span className="flex items-center px-3 text-sm text-[#616161]">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="ms-btn-secondary disabled:opacity-40"
              style={{ padding: '6px 14px', fontSize: '13px' }}
            >
              Suivant →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
