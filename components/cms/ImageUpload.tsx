'use client';

import { useState } from 'react';
import { MediaPickerModal } from './MediaPickerModal';

interface Props {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
}

export function ImageUpload({ value, onChange, label = 'Bild wählen' }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ width: '80px', height: '56px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #E2DBCF', background: '#F4F1EA', flexShrink: 0 }}>
          {value ? (
            <img src={value} alt="Vorschau" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '11px', color: '#9A9088', textAlign: 'center', padding: '0 4px' }}>Kein Bild</span>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{ background: '#16242B', color: '#fff', borderRadius: '8px', padding: '8px 16px', fontSize: '14px', fontWeight: 500, border: 'none', cursor: 'pointer' }}
        >
          {label}
        </button>
      </div>

      {open && (
        <MediaPickerModal
          onSelect={(url) => { onChange(url); setOpen(false); }}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
