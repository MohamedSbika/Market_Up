'use client';

import { useState, useEffect } from 'react';
import { VideoManager } from '@/components/dashboard/VideoManager';
import type { IVideo } from '@/types';

interface TraceUpData {
  status:    string;
  isPublic:  boolean;
  videos:    IVideo[];
  viewCount: number;
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  active:   { label: 'Actif',         color: '#107C10', bg: '#DFF6DD' },
  pending:  { label: 'En validation', color: '#8A6C00', bg: '#FFF4CE' },
  disabled: { label: 'Désactivé',     color: '#616161', bg: '#F5F5F5' },
};

export default function TraceUpDashboardPage() {
  const [data,       setData]       = useState<TraceUpData | null>(null);
  const [isLoading,  setIsLoading]  = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [success,    setSuccess]    = useState('');

  useEffect(() => {
    fetch('/api/dashboard/traceup')
      .then((r) => r.json())
      .then(setData)
      .catch(() => setError('Erreur de chargement.'))
      .finally(() => setIsLoading(false));
  }, []);

  const toggleVisibility = async () => {
    if (!data) return;
    setIsToggling(true);
    setError(null);
    setSuccess('');
    try {
      const res  = await fetch('/api/dashboard/traceup', {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ isPublic: !data.isPublic }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? 'Erreur.');
        return;
      }
      setData((prev) => prev ? { ...prev, isPublic: !prev.isPublic, status: json.profile?.status ?? prev.status } : prev);
      setSuccess('Visibilité mise à jour.');
    } catch {
      setError('Erreur inattendue.');
    } finally {
      setIsToggling(false);
    }
  };

  const handleAdd = async (video: Omit<IVideo, '_id'>): Promise<void> => {
    const res  = await fetch('/api/dashboard/traceup/videos', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        youtubeUrl:  video.youtubeUrl,
        title:       video.title,
        description: video.description ?? '',
        category:    video.category,
      }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? 'Erreur lors de l\'ajout.');
    setData((prev) => prev ? { ...prev, videos: [...prev.videos, json.video] } : prev);
    setSuccess('Vidéo ajoutée.');
  };

  const handleDelete = async (videoId: string): Promise<void> => {
    const res  = await fetch(`/api/dashboard/traceup/videos/${videoId}`, { method: 'DELETE' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? 'Erreur lors de la suppression.');
    setData((prev) => prev ? { ...prev, videos: prev.videos.filter((v) => v._id !== videoId) } : prev);
    setSuccess('Vidéo supprimée.');
  };

  if (isLoading) {
    return (
      <div className="max-w-[700px] mx-auto">
        <div className="ms-card p-6 animate-pulse space-y-3">
          {[1,2,3].map((i) => <div key={i} className="h-10 bg-[#E0E0E0] rounded" />)}
        </div>
      </div>
    );
  }

  const statusInfo = STATUS_LABELS[data?.status ?? 'disabled'];

  return (
    <div className="max-w-[700px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#242424]" style={{ letterSpacing: '-0.02em' }}>
            Profil TraceUP
          </h1>
          <p className="text-sm text-[#616161] mt-1">Gérez vos vidéos YouTube.</p>
        </div>
        {statusInfo && (
          <span
            className="px-3 py-1 rounded-full text-xs font-semibold"
            style={{ background: statusInfo.bg, color: statusInfo.color }}
          >
            {statusInfo.label}
          </span>
        )}
      </div>

      {error && (
        <div className="p-3 rounded text-sm" style={{ background: '#FFF5F5', color: '#D13438', border: '1px solid #FCA5A5' }}>
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 rounded text-sm" style={{ background: '#DFF6DD', color: '#107C10', border: '1px solid #92C353' }}>
          {success}
        </div>
      )}

      {/* Visibility toggle */}
      <div className="ms-card p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[#242424]">Rendre le profil public</p>
          <p className="text-xs text-[#616161] mt-0.5">
            {data?.videos.length === 0
              ? 'Ajoutez au moins une vidéo pour activer.'
              : 'Activez pour que votre galerie soit visible dans TraceUP.'}
          </p>
        </div>
        <button
          type="button"
          onClick={toggleVisibility}
          disabled={isToggling || (data?.videos.length === 0 && !data?.isPublic)}
          className="relative w-12 h-6 rounded-full transition-colors disabled:opacity-50"
          style={{ background: data?.isPublic ? '#8764B8' : '#E0E0E0' }}
        >
          <span
            className="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform"
            style={{ left: data?.isPublic ? '26px' : '4px' }}
          />
        </button>
      </div>

      {/* Stats */}
      <div className="ms-card p-4 flex gap-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-[#242424]">{data?.videos.length ?? 0}</p>
          <p className="text-xs text-[#616161]">vidéos</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-[#242424]">{data?.viewCount ?? 0}</p>
          <p className="text-xs text-[#616161]">vues</p>
        </div>
      </div>

      {/* Video manager */}
      <div className="ms-card p-6">
        <h2 className="text-sm font-semibold text-[#242424] mb-4">Mes vidéos</h2>
        <VideoManager
          videos={data?.videos ?? []}
          onAdd={handleAdd}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
