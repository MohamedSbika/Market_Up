'use client';

/**
 * GalleryUpload — Drag-and-drop image uploader for BrandUP gallery.
 * Max 10 images. Calls /api/uploads and returns the URL.
 */
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface GalleryItem {
  url:        string;
  uploadedAt: string;
}

interface GalleryUploadProps {
  value:     GalleryItem[];
  onChange:  (items: GalleryItem[]) => void;
  disabled?: boolean;
}

const MAX_IMAGES = 10;

export function GalleryUpload({ value, onChange, disabled = false }: GalleryUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (value.length >= MAX_IMAGES) {
      setError(`Maximum ${MAX_IMAGES} images allowed.`);
      return;
    }

    const remaining = MAX_IMAGES - value.length;
    const filesToUpload = acceptedFiles.slice(0, remaining);

    setUploading(true);
    setError(null);

    try {
      const uploaded: GalleryItem[] = [];

      for (const file of filesToUpload) {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/uploads', { method: 'POST', body: formData });
        const data = await res.json() as { url?: string; error?: string };

        if (!res.ok || !data.url) {
          setError(typeof data.error === 'string' ? data.error : 'Upload failed');
          break;
        }

        uploaded.push({ url: data.url, uploadedAt: new Date().toISOString() });
      }

      if (uploaded.length > 0) {
        onChange([...value, ...uploaded]);
      }
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [value, onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    disabled: disabled || uploading || value.length >= MAX_IMAGES,
    multiple: true,
  });

  const removeImage = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      {value.length < MAX_IMAGES && (
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
            isDragActive
              ? 'border-[#0078D4] bg-[#EFF6FC]'
              : 'border-[#D1D1D1] hover:border-[#0078D4] hover:bg-[#F5F5F5]',
            (disabled || uploading) && 'opacity-50 cursor-not-allowed'
          )}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-[#0078D4] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-[#616161]">Upload en cours…</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#616161" strokeWidth="1.5" strokeLinecap="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <p className="text-sm text-[#616161]">
                {isDragActive ? 'Déposez ici…' : 'Glissez des images ou cliquez pour sélectionner'}
              </p>
              <p className="text-xs text-[#A0A0A0]">
                JPEG, PNG, WEBP — Max 5 MB — {value.length}/{MAX_IMAGES} images
              </p>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-[#D13438]">{error}</p>
      )}

      {/* Image grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {value.map((item, i) => (
            <div key={i} className="relative aspect-square rounded overflow-hidden group" style={{ border: '1px solid #E0E0E0' }}>
              <Image
                src={item.url}
                alt={`Gallery image ${i + 1}`}
                fill
                className="object-cover"
                sizes="120px"
              />
              {!disabled && (
                <button
                  onClick={() => removeImage(i)}
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  aria-label={`Remove image ${i + 1}`}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
