'use client';

/**
 * VideoManager — Add/remove YouTube videos for TraceUP profile.
 * Shows thumbnail previews using YouTube's thumbnail API.
 */
import { useState } from 'react';
import Image from 'next/image';
import { extractYouTubeId, getYouTubeThumbnail } from '@/lib/utils';
import { addVideoSchema } from '@/lib/validations';
import type { IVideo, VideoCategory } from '@/types';

interface VideoManagerProps {
  videos:   IVideo[];
  onAdd:    (video: Omit<IVideo, '_id'>) => Promise<void>;
  onDelete: (videoId: string) => Promise<void>;
}

const CATEGORIES: { value: VideoCategory; label: string }[] = [
  { value: 'actualite', label: 'Actualité'  },
  { value: 'offres',    label: 'Offres'     },
  { value: 'astuces',   label: 'Astuces'    },
  { value: 'emplois',   label: 'Emplois'    },
];

export function VideoManager({ videos, onAdd, onDelete }: VideoManagerProps) {
  const [url,         setUrl]         = useState('');
  const [title,       setTitle]       = useState('');
  const [description, setDescription] = useState('');
  const [category,    setCategory]    = useState<VideoCategory>('actualite');
  const [adding,      setAdding]      = useState(false);
  const [deleting,    setDeleting]    = useState<string | null>(null);
  const [errors,      setErrors]      = useState<Record<string, string>>({});

  const preview = url ? extractYouTubeId(url) : null;

  const handleAdd = async () => {
    const result = addVideoSchema.safeParse({ youtubeUrl: url, title, description, category });
    if (!result.success) {
      const fe = result.error.flatten().fieldErrors;
      setErrors({
        youtubeUrl:  fe.youtubeUrl?.[0] ?? '',
        title:       fe.title?.[0] ?? '',
        description: fe.description?.[0] ?? '',
      });
      return;
    }

    setErrors({});
    setAdding(true);

    try {
      await onAdd({ youtubeUrl: url, title, description: description || undefined, category, addedAt: new Date().toISOString() });
      setUrl(''); setTitle(''); setDescription(''); setCategory('actualite');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try { await onDelete(id); }
    finally { setDeleting(null); }
  };

  return (
    <div className="space-y-6">
      {/* Add video form */}
      <div className="ms-card space-y-4">
        <h3 className="font-semibold text-[15px] text-[#242424]">Ajouter une vidéo</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="ms-label">URL YouTube</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className={`ms-input flex-1 ${errors.youtubeUrl ? 'error' : ''}`}
              />
              {preview && (
                <div className="relative w-16 h-10 rounded overflow-hidden flex-shrink-0" style={{ border: '1px solid #E0E0E0' }}>
                  <Image src={getYouTubeThumbnail(preview)} alt="Preview" fill className="object-cover" sizes="64px" />
                </div>
              )}
            </div>
            {errors.youtubeUrl && <p className="text-xs text-[#D13438] mt-1">{errors.youtubeUrl}</p>}
          </div>

          <div>
            <label className="ms-label">Titre *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              className={`ms-input ${errors.title ? 'error' : ''}`}
              placeholder="Titre de la vidéo"
            />
            {errors.title && <p className="text-xs text-[#D13438] mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="ms-label">Catégorie</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as VideoCategory)}
              className="ms-input"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="ms-label">Description (optionnel)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
              rows={2}
              className="ms-input resize-none"
              placeholder="Courte description de la vidéo…"
            />
          </div>
        </div>

        <button
          onClick={handleAdd}
          disabled={adding}
          className="ms-btn-primary disabled:opacity-60"
        >
          {adding ? 'Ajout…' : '+ Ajouter la vidéo'}
        </button>
      </div>

      {/* Video list */}
      {videos.length === 0 ? (
        <p className="text-sm text-[#616161] text-center py-6">Aucune vidéo ajoutée.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video) => {
            const vid = extractYouTubeId(video.youtubeUrl);
            return (
              <div key={video._id} className="ms-card p-0 overflow-hidden" style={{ padding: 0 }}>
                <div className="relative aspect-video bg-[#F5F5F5]">
                  {vid && (
                    <Image src={getYouTubeThumbnail(vid)} alt={video.title} fill className="object-cover" sizes="300px" />
                  )}
                  <span
                    className="absolute bottom-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded"
                    style={{ background: '#8764B8', color: '#FFFFFF' }}
                  >
                    {CATEGORIES.find((c) => c.value === video.category)?.label ?? video.category}
                  </span>
                </div>
                <div className="p-3 flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-[#242424] line-clamp-2 flex-1">{video.title}</p>
                  <button
                    onClick={() => handleDelete(video._id)}
                    disabled={deleting === video._id}
                    className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded hover:bg-[#FFF5F5] transition-colors disabled:opacity-50"
                    aria-label={`Delete ${video.title}`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D13438" strokeWidth="2">
                      <path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
