'use client';

import { useState, useRef } from 'react';
import { useCMS } from '@/components/cms/CMSProvider';
import { PublishBar } from '@/components/cms/PublishBar';
import { MediaItem } from '@/lib/content-schema';

export default function MediathekPage() {
  const { store } = useCMS();
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting]   = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!store) return null;
  const media: MediaItem[] = store.media ?? [];

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append('file', file);
        await fetch('/api/media', { method: 'POST', body: fd });
      }
      window.location.reload();
    } catch (e) {
      console.error('Upload error:', e);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bild wirklich löschen?')) return;
    setDeleting(id);
    try {
      await fetch('/api/media', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      window.location.reload();
    } finally {
      setDeleting(null);
    }
  };

  return (
    <>
      <PublishBar title="Mediathek" subtitle={`${media.length} Bilder`} />
      <main className="flex-1 p-7 overflow-auto">

        {/* Upload zone */}
        <div
          className="flex flex-col items-center justify-center rounded-card cursor-pointer mb-7 transition-colors"
          style={{
            border: '2px dashed #C2724A55',
            backgroundColor: '#FDF8F5',
            minHeight: '140px',
            gap: '12px',
          }}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleUpload(e.dataTransfer.files); }}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
          {uploading ? (
            <p className="text-sm text-body-light">Wird hochgeladen…</p>
          ) : (
            <>
              <span style={{ fontSize: '32px' }}>+</span>
              <p className="text-sm font-medium text-ink">Bilder hierher ziehen oder klicken zum Hochladen</p>
              <p className="text-xs text-body-light">PNG, JPG, WebP · Max. 5 MB pro Bild</p>
            </>
          )}
        </div>

        {/* Media grid */}
        {media.length === 0 ? (
          <p className="text-center text-sm text-body-light py-12">Noch keine Bilder in der Bibliothek.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {media.map((item) => (
              <div
                key={item.id}
                className="group relative rounded-card overflow-hidden bg-white"
                style={{ border: '1px solid #EAE3D8', aspectRatio: '4/3' }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'linear-gradient(0deg, rgba(22,36,43,0.82) 0%, transparent 60%)' }}>
                  <div className="px-3 pb-3">
                    <p className="text-white text-xs truncate font-mono">{item.name}</p>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deleting === item.id}
                      className="mt-1.5 text-xs px-2 py-1 rounded text-white/80 hover:text-white transition-colors"
                      style={{ backgroundColor: 'rgba(180,50,50,0.6)' }}
                    >
                      {deleting === item.id ? '…' : 'Löschen'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </>
  );
}
