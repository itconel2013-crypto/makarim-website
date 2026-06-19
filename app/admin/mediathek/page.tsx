'use client';

import { useState, useRef } from 'react';
import { useCMS } from '@/components/cms/CMSProvider';
import { PublishBar } from '@/components/cms/PublishBar';
import { MediaItem } from '@/lib/content-schema';

export default function MediathekPage() {
  const { store } = useCMS();
  const [uploading, setUploading]     = useState(false);
  const [deleting, setDeleting]       = useState<string | null>(null);
  const [selected, setSelected]       = useState<MediaItem | null>(null);
  const [altText, setAltText]         = useState('');
  const [titleText, setTitleText]     = useState('');
  const [saving, setSaving]           = useState(false);
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
      if (selected?.id === id) setSelected(null);
      window.location.reload();
    } finally {
      setDeleting(null);
    }
  };

  const handleSelect = (item: MediaItem) => {
    setSelected(item);
    setAltText(item.alt ?? '');
    setTitleText(item.title ?? '');
  };

  const handleSaveMeta = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await fetch('/api/media', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selected.id, alt: altText, title: titleText }),
      });
      window.location.reload();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PublishBar title="Mediathek" subtitle={`${media.length} Bilder`} />
      <div className="flex flex-1 overflow-hidden">

        {/* Left: grid */}
        <main className="flex-1 p-7 overflow-auto">
          {/* Upload zone */}
          <div
            className="flex flex-col items-center justify-center rounded-card cursor-pointer mb-7 transition-colors"
            style={{ border: '2px dashed #C2724A55', backgroundColor: '#FDF8F5', minHeight: '120px', gap: '10px' }}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); handleUpload(e.dataTransfer.files); }}
          >
            <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleUpload(e.target.files)} />
            {uploading ? (
              <p className="text-sm text-body-light">Wird hochgeladen…</p>
            ) : (
              <>
                <span style={{ fontSize: '28px' }}>+</span>
                <p className="text-sm font-medium text-ink">Bilder hierher ziehen oder klicken</p>
                <p className="text-xs text-body-light">PNG, JPG, WebP · Max. 5 MB pro Bild</p>
              </>
            )}
          </div>

          {/* Grid */}
          {media.length === 0 ? (
            <p className="text-center text-sm text-body-light py-12">Noch keine Bilder in der Bibliothek.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {media.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className="group relative rounded-card overflow-hidden cursor-pointer"
                  style={{
                    border: selected?.id === item.id ? '2px solid #C2724A' : '1px solid #EAE3D8',
                    aspectRatio: '4/3',
                    backgroundColor: '#F4F1EA',
                  }}
                >
                  <img src={item.url} alt={item.alt ?? item.name} className="w-full h-full object-cover" />
                  {/* SEO badge */}
                  {!item.alt && (
                    <div className="absolute top-2 right-2">
                      <span style={{ background: '#C2724A', color: '#fff', fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '6px', letterSpacing: '0.05em' }}>
                        ALT FEHLT
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: 'linear-gradient(0deg, rgba(22,36,43,0.82) 0%, transparent 60%)' }}>
                    <div className="px-3 pb-3">
                      <p className="text-white text-xs truncate font-mono">{item.name}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Right: detail panel */}
        <div style={{ width: '300px', borderLeft: '1px solid #E4DDD2', backgroundColor: '#FAF7F4', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
          {selected ? (
            <div className="p-6 flex flex-col gap-5 overflow-auto">
              {/* Preview */}
              <div style={{ borderRadius: '10px', overflow: 'hidden', aspectRatio: '16/9', background: '#E8E2D8' }}>
                <img src={selected.url} alt={selected.alt ?? selected.name} className="w-full h-full object-cover" />
              </div>

              <div>
                <p className="text-xs font-mono text-body-light truncate">{selected.name}</p>
                <p className="text-xs text-body-light mt-0.5">{new Date(selected.uploadedAt).toLocaleDateString('de-DE')}</p>
              </div>

              {/* Alt text */}
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">
                  Alt-Text <span style={{ color: '#C2724A' }}>*</span>
                </label>
                <p className="text-xs text-body-light mb-2">Beschreibt das Bild für Google & Screenreader. Konkret und kurz halten.</p>
                <textarea
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  rows={3}
                  placeholder="z. B. Pilger beim Tawaf um die Kaaba in Mekka"
                  className="w-full text-sm rounded-button px-3 py-2 resize-none"
                  style={{ border: '1px solid #D4CDBE', backgroundColor: '#fff', fontFamily: 'inherit', outline: 'none' }}
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Titel (optional)</label>
                <p className="text-xs text-body-light mb-2">Erscheint als Tooltip beim Hovern. Ergänzt den Alt-Text.</p>
                <input
                  type="text"
                  value={titleText}
                  onChange={(e) => setTitleText(e.target.value)}
                  placeholder="z. B. Masjid al-Haram, Mekka 2025"
                  className="w-full text-sm rounded-button px-3 py-2"
                  style={{ border: '1px solid #D4CDBE', backgroundColor: '#fff', fontFamily: 'inherit', outline: 'none' }}
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSaveMeta}
                  disabled={saving}
                  className="flex-1 py-2 rounded-button text-sm font-semibold text-white disabled:opacity-60"
                  style={{ backgroundColor: '#16242B' }}
                >
                  {saving ? 'Speichern…' : 'Speichern'}
                </button>
                <button
                  onClick={() => handleDelete(selected.id)}
                  disabled={deleting === selected.id}
                  className="px-3 py-2 rounded-button text-sm font-medium"
                  style={{ backgroundColor: '#FDE8E8', color: '#B43232' }}
                >
                  Löschen
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 p-8 text-center">
              <p style={{ fontSize: '32px', marginBottom: '12px' }}>🖼</p>
              <p className="text-sm font-medium text-ink">Bild auswählen</p>
              <p className="text-xs text-body-light mt-1">Klicke auf ein Bild um Alt-Text und Titel zu bearbeiten</p>
            </div>
          )}
        </div>

      </div>
    </>
  );
}
