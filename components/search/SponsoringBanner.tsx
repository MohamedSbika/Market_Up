'use client';

/**
 * SponsoringBanner — Ad banner displayed at the top of search results.
 * Clicking increments clickCount and redirects to targetUrl.
 */
import Image from 'next/image';
import type { ISponsoring } from '@/types';
import { cn } from '@/lib/utils';

interface SponsoringBannerProps {
  sponsor:   ISponsoring | null;
  className?: string;
}

export function SponsoringBanner({ sponsor, className }: SponsoringBannerProps) {
  if (!sponsor) return null;

  const handleClick = async () => {
    try {
      // Track click server-side before redirecting
      const res = await fetch(`/api/sponsoring/${sponsor._id}/click`, { method: 'POST' });
      const data = await res.json() as { targetUrl?: string };
      if (data.targetUrl) {
        window.open(data.targetUrl, '_blank', 'noopener,noreferrer');
      }
    } catch {
      // Fall back to direct redirect on fetch error
      window.open(sponsor.targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      className={cn(
        'relative cursor-pointer rounded-lg overflow-hidden border transition-shadow',
        'hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)]',
        className
      )}
      style={{ borderColor: '#E0E0E0' }}
      aria-label={`Publicité: ${sponsor.name}`}
    >
      {/* Sponsored label */}
      <div
        className="absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded z-10"
        style={{ background: 'rgba(0,0,0,0.5)', color: '#FFFFFF' }}
      >
        Sponsorisé
      </div>

      <Image
        src={sponsor.imageUrl}
        alt={sponsor.name}
        width={1200}
        height={200}
        className="w-full h-auto object-cover"
        style={{ maxHeight: '120px' }}
        priority
      />
    </div>
  );
}
