'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';

/**
 * Bilder-Slider für einen Galerie-Eintrag (Album). Bei nur einem Bild wird es
 * einfach angezeigt — ohne Bedienelemente. Bewusst ohne Bibliothek: Pfeile,
 * Punkte, Zähler und Wischen auf dem Handy.
 */
export function GallerySlider({ images, alt }: { images: string[]; alt: string }) {
  const [i, setI] = useState(0);
  const touchX = useRef<number | null>(null);
  const n = images.length;

  if (n === 0) return null;

  const go = (d: number) => setI((p) => (p + d + n) % n);

  const arrow: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: 'rgba(255,255,255,0.9)',
    color: '#16242B',
    fontSize: '20px',
    lineHeight: 1,
    cursor: 'pointer',
    boxShadow: '0 2px 10px rgba(0,0,0,0.18)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div
      className="relative w-full select-none"
      style={{ aspectRatio: '4 / 3', backgroundColor: '#F4F1EA' }}
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);   // wischen
        touchX.current = null;
      }}
    >
      {/* Nur das aktuelle Bild rendern — Alben können viele Fotos haben */}
      <Image
        key={i}
        src={images[i]}
        alt={n > 1 ? `${alt} (${i + 1} von ${n})` : alt}
        fill
        className="object-cover"
      />

      {n > 1 && (
        <>
          <button type="button" onClick={() => go(-1)} aria-label="Vorheriges Bild" style={{ ...arrow, left: '10px' }}>‹</button>
          <button type="button" onClick={() => go(1)} aria-label="Nächstes Bild" style={{ ...arrow, right: '10px' }}>›</button>

          {/* Zähler */}
          <span
            style={{
              position: 'absolute', top: '10px', right: '10px',
              backgroundColor: 'rgba(22,36,43,0.72)', color: '#fff',
              fontSize: '12px', fontWeight: 600, borderRadius: '20px', padding: '3px 10px',
            }}
          >
            {i + 1} / {n}
          </span>

          {/* Punkte */}
          <div style={{ position: 'absolute', bottom: '10px', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '6px' }}>
            {images.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setI(idx)}
                aria-label={`Bild ${idx + 1} anzeigen`}
                style={{
                  width: '7px', height: '7px', borderRadius: '50%', border: 'none', padding: 0, cursor: 'pointer',
                  backgroundColor: idx === i ? '#fff' : 'rgba(255,255,255,0.55)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
