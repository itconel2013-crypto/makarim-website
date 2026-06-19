'use client';

import { useCMS } from '../CMSProvider';

export function UeberUnsPreview() {
  const { store } = useCMS();
  if (!store) return null;

  const { about } = store.c;

  return (
    <div style={{ fontFamily: "'Schibsted Grotesk', sans-serif", backgroundColor: '#F4F1EA', padding: '22px 20px' }}>

      {/* Images */}
      <div style={{ display: 'grid', gridTemplateColumns: about.url2 ? '1fr 1fr' : '1fr', gap: '10px', marginBottom: '16px' }}>
        <div style={{ height: '160px', borderRadius: '12px', overflow: 'hidden', background: '#D5CEBC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {about.url ? (
            <img src={about.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          ) : (
            <span style={{ fontSize: '32px', opacity: 0.3 }}>🖼</span>
          )}
        </div>
        {about.url2 && (
          <div style={{ height: '160px', borderRadius: '12px', overflow: 'hidden', background: '#D5CEBC' }}>
            <img src={about.url2} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        )}
      </div>

      {/* Title */}
      <div style={{ fontFamily: "'Newsreader', serif", fontSize: '22px', color: '#16242B', lineHeight: 1.2, marginBottom: '12px' }}>
        {about.title}
      </div>

      {/* Body */}
      <p style={{ fontSize: '13px', lineHeight: 1.65, color: '#5A5448', margin: '0 0 22px', whiteSpace: 'pre-wrap' }}>
        {about.body}
      </p>

      {/* Why Makarim */}
      <div style={{ fontFamily: "'Newsreader', serif", fontSize: '18px', color: '#16242B', lineHeight: 1.2, marginBottom: '9px' }}>
        {about.whyTitle}
      </div>
      <p style={{ fontSize: '12.5px', lineHeight: 1.6, color: '#5A5448', margin: '0 0 16px' }}>
        {about.whyBody}
      </p>

      {/* Tiles 2-col */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {about.tiles.map((tile, i) => (
          <div key={i} style={{ background: '#F7ECE4', borderRadius: '12px', padding: '13px 14px' }}>
            <div style={{ fontFamily: "'Newsreader', serif", fontSize: '14px', color: '#16242B', marginBottom: '6px', lineHeight: 1.25 }}>
              {tile.t}
            </div>
            <p style={{ fontSize: '11px', lineHeight: 1.55, color: '#6B6457', margin: 0 }}>
              {tile.b}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
