'use client';

import { useState, useEffect, useRef } from 'react';
import { MediaItem } from '@/lib/content-schema';

interface Props {
  onSelect: (url: string) => void;
  onClose: () => void;
}

export function MediaPickerModal({ onSelect, onClose }: Props) {
  const [media, setMedia]       = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [hovered, setHovered]   = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/media').then(r => r.json()).then(setMedia);
  }, []);

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const results: MediaItem[] = [];
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch('/api/media', { method: 'POST', body: fd });
        const data = await res.json();
        if (data.item) results.push(data.item);
      }
      setMedia(prev => [...results, ...prev]);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(22,36,43,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: '#FAF7F4', borderRadius: '16px', width: '780px', maxWidth: '95vw', maxHeight: '86vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.22)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid #E4DDD2', flexShrink: 0 }}>
          <span style={{ fontFamily: "'Newsreader', serif", fontSize: '20px', color: '#16242B' }}>Bild auswählen</span>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              style={{ background: '#16242B', color: '#fff', borderRadius: '10px', padding: '8px 18px', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer', opacity: uploading ? 0.6 : 1 }}
            >
              {uploading ? 'Hochladen…' : '+ Neu hochladen'}
            </button>
            <button
              onClick={onClose}
              style={{ background: '#EDE8E1', border: 'none', borderRadius: '10px', width: '36px', height: '36px', fontSize: '20px', cursor: 'pointer', color: '#5A5448', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Grid */}
        <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px' }}>
          {media.length === 0 && !uploading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <p style={{ fontSize: '32px', marginBottom: '12px' }}>🖼</p>
              <p style={{ color: '#7C746A', fontSize: '14px' }}>Noch keine Bilder. Lade dein erstes Bild hoch.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {media.map(item => (
                <div
                  key={item.id}
                  onClick={() => onSelect(item.url)}
                  onMouseEnter={() => setHovered(item.id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    borderRadius: '10px', overflow: 'hidden', cursor: 'pointer',
                    border: hovered === item.id ? '2px solid #C2724A' : '1px solid #E4DDD2',
                    background: '#F4F1EA', transition: 'border-color 0.15s',
                  }}
                >
                  <img
                    src={item.url}
                    alt={item.alt ?? item.name}
                    style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }}
                  />
                  <p style={{ fontSize: '11px', color: '#7C746A', padding: '6px 10px', fontFamily: 'monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>
                    {item.name}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={(e) => handleUpload(e.target.files)} />
      </div>
    </div>
  );
}
