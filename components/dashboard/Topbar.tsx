'use client';

/**
 * Topbar — Sticky dashboard top navigation bar.
 * Shows page title and notification bell.
 */
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface TopbarProps {
  title:        string;
  unreadCount?: number;
  className?:   string;
}

export function Topbar({ title, unreadCount = 0, className }: TopbarProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-20 flex items-center justify-between px-6 h-14 border-b',
        className
      )}
      style={{ background: '#FFFFFF', borderColor: '#E0E0E0' }}
    >
      <h1 className="font-semibold text-[15px] text-[#242424]" style={{ letterSpacing: '-0.01em' }}>
        {title}
      </h1>

      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <Link
          href="/dashboard/notifications"
          className="relative w-9 h-9 flex items-center justify-center rounded hover:bg-[#F5F5F5] transition-colors"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} non lues)` : ''}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#616161" strokeWidth="1.5" strokeLinecap="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          {unreadCount > 0 && (
            <span
              className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
              style={{ background: '#D13438' }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
