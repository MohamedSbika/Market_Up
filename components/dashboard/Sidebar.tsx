'use client';

/**
 * Sidebar — Dashboard left navigation.
 * office.com style: #1F1F1F background, active item has left blue border.
 */
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';

const navItems = [
  {
    label: 'Tableau de bord',
    href: '/dashboard',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    exact: true,
  },
  {
    label: 'Mon Compte',
    href: '/dashboard/account',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  },
  { label: 'MOTEURS', type: 'section' as const },
  {
    label: 'BrandUP',
    href: '/dashboard/brandup',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>,
    accent: '#0078D4',
  },
  {
    label: 'TraceUP',
    href: '/dashboard/traceup',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>,
    accent: '#8764B8',
  },
  {
    label: 'LinkUP',
    href: '/dashboard/linkup',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
    accent: '#C5A059',
  },
  { label: 'VISIBILITÉ', type: 'section' as const },
  {
    label: 'Boost',
    href: '/dashboard/boost',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M13 2L4.09 12.97H11L10 22L20.91 11.03H14L13 2Z"/></svg>,
  },
  {
    label: 'Sponsoring',
    href: '/dashboard/sponsoring',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  },
  {
    label: 'RSE',
    href: '/dashboard/rse',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>,
  },
  { label: 'COMPTE', type: 'section' as const },
  {
    label: 'Facturation',
    href: '/dashboard/billing',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  },
  {
    label: 'Notifications',
    href: '/dashboard/notifications',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  },
  {
    label: 'Paramètres',
    href: '/dashboard/settings',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  },
];

interface SidebarProps {
  userName: string;
  userEmail: string;
  unreadCount?: number;
}

export function Sidebar({ userName, userEmail, unreadCount = 0 }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 w-60 flex flex-col z-30"
      style={{ background: '#1F1F1F' }}
    >
      {/* Logo */}
      <div className="px-4 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <span className="font-bold text-lg" style={{ letterSpacing: '-0.02em' }}>
          <span style={{ color: '#60AFFE' }}>MARKET</span>
          <span style={{ color: 'rgba(255,255,255,0.65)' }}>UP</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {navItems.map((item, i) => {
          if (item.type === 'section') {
            return (
              <div
                key={i}
                className="px-4 pt-5 pb-1 text-[9px] font-bold tracking-widest uppercase"
                style={{ color: 'rgba(255,255,255,0.25)' }}
              >
                {item.label}
              </div>
            );
          }

          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href!);

          return (
            <Link
              key={item.href}
              href={item.href!}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 mx-2 rounded text-sm transition-colors relative',
                isActive
                  ? 'font-medium'
                  : 'hover:bg-[rgba(255,255,255,0.06)]'
              )}
              style={
                isActive
                  ? {
                      background:  'rgba(0,120,212,0.2)',
                      color:       '#60AFFE',
                      borderLeft:  '3px solid #0078D4',
                      paddingLeft: '13px', // compensate for border
                    }
                  : { color: 'rgba(255,255,255,0.65)' }
              }
            >
              <span style={isActive ? { color: '#60AFFE' } : { color: 'rgba(255,255,255,0.45)' }}>
                {item.icon}
              </span>
              {item.label}
              {item.href === '/dashboard/notifications' && unreadCount > 0 && (
                <span
                  className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: '#0078D4', color: '#FFFFFF', minWidth: '18px', textAlign: 'center' }}
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User info + logout */}
      <div className="border-t px-4 py-3" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-8 h-8 rounded flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: '#0078D4' }}
          >
            {userName.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium truncate" style={{ color: 'rgba(255,255,255,0.9)' }}>{userName}</p>
            <p className="text-[10px] truncate" style={{ color: 'rgba(255,255,255,0.45)' }}>{userEmail}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/signin' })}
          className="flex items-center gap-2 text-xs w-full py-1.5 px-2 rounded transition-colors"
          style={{ color: 'rgba(255,255,255,0.45)' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.9)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
