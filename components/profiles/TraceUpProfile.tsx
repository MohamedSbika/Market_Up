/**
 * TraceUpProfile — YouTube media profile view.
 * isModal=true: compact inline version.
 */
import Link from 'next/link';
import Image from 'next/image';
import { CompanyInitials } from '@/components/shared/CompanyInitials';
import { RSEBadge } from '@/components/shared/RSEBadge';
import { BoostTag } from '@/components/shared/BoostTag';
import { getYouTubeThumbnail, extractYouTubeId } from '@/lib/utils';
import type { ITraceUpProfile, SafeCompany } from '@/types';

interface TraceUpProfileProps {
  company:  SafeCompany;
  profile:  ITraceUpProfile;
  rse?: { badgeActive: boolean };
  isModal?: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  actualite: 'Actualité',
  offres:    'Offres',
  astuces:   'Astuces',
  emplois:   'Emplois',
};

const accent = '#8764B8';

export function TraceUpProfile({ company, profile, rse, isModal = false }: TraceUpProfileProps) {
  return (
    <div className={isModal ? '' : 'max-w-[900px] mx-auto px-4 py-8'}>
      {/* Header */}
      <div className="ms-card mb-4">
        <div className="flex items-start gap-4">
          <CompanyInitials name={company.name} logo={company.logo} size={isModal ? 'lg' : 'xl'} />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className={`font-bold text-[#242424] ${isModal ? 'text-lg' : 'text-2xl'}`} style={{ letterSpacing: '-0.01em' }}>
                {company.name}
              </h1>
              {profile.isBoostActive && <BoostTag />}
              {rse?.badgeActive && <RSEBadge />}
            </div>
            <div className="flex gap-2">
              <span className="text-sm px-2 py-0.5 rounded font-medium" style={{ background: '#F4F0FB', color: accent }}>
                {company.type}
              </span>
              <span className="text-sm text-[#616161]">{profile.videos.length} vidéo{profile.videos.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Video grid */}
      {profile.videos.length === 0 ? (
        <div className="ms-card text-center py-10">
          <p className="text-[#616161]">Aucune vidéo publiée pour le moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {profile.videos.map((video) => {
            const videoId   = extractYouTubeId(video.youtubeUrl);
            const thumbnail = videoId ? getYouTubeThumbnail(videoId) : '';

            return (
              <a
                key={video._id}
                href={video.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ms-card p-0 overflow-hidden group flex flex-col"
                style={{ padding: 0 }}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden bg-[#F5F5F5]">
                  {thumbnail && (
                    <Image
                      src={thumbnail}
                      alt={video.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                      sizes="(max-width: 640px) 100vw, 33vw"
                    />
                  )}
                  {/* Play overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill={accent}>
                        <polygon points="5 3 19 12 5 21 5 3"/>
                      </svg>
                    </div>
                  </div>
                  {/* Category badge */}
                  <span
                    className="absolute bottom-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded"
                    style={{ background: accent, color: '#FFFFFF' }}
                  >
                    {CATEGORY_LABELS[video.category] ?? video.category}
                  </span>
                </div>

                {/* Info */}
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-[#242424] line-clamp-2">{video.title}</h3>
                  {video.description && (
                    <p className="text-xs text-[#616161] mt-1 line-clamp-2">{video.description}</p>
                  )}
                </div>
              </a>
            );
          })}
        </div>
      )}

      {/* Modal CTA */}
      {isModal && (
        <div className="mt-4">
          <Link
            href={`/traceup/${company.slug}`}
            className="ms-btn-secondary w-full justify-center"
            style={{ display: 'flex', borderColor: accent, color: accent }}
          >
            Voir le profil complet
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-1">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
}
