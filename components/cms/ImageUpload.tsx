'use client';

import { useRef, useState } from 'react';

interface Props {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
}

export function ImageUpload({ value, onChange, label = 'Bild wählen / hochladen' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/media', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.item?.url) onChange(data.item.url);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div className="flex items-center gap-4">
      <div
        className="flex-shrink-0 rounded-button overflow-hidden bg-border-light"
        style={{ width: '80px', height: '56px', border: '1px solid #E2DBCF' }}
      >
        {value ? (
          <img src={value} alt="Vorschau" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-body-light text-xs text-center px-1">Kein Bild</span>
          </div>
        )}
      </div>

      <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleChange}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="px-4 py-2 rounded-button text-sm font-medium text-white transition-opacity disabled:opacity-60"
          style={{ backgroundColor: '#16242B' }}
        >
          {loading ? 'Wird hochgeladen…' : label}
        </button>
        <p className="text-xs text-body-light mt-1">JPG, PNG, WebP · max. 5 MB</p>
      </div>
    </div>
  );
}
