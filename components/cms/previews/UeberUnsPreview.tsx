'use client';

import { useCMS } from '../CMSProvider';

export function UeberUnsPreview() {
  const { store } = useCMS();
  if (!store) return null;

  const { about } = store.c;

  return (
    <div style={{ fontFamily: "'Schibsted Grotesk', sans-serif", backgroundColor: '#F4F1EA' }}>
      {/* Intro */}
      <section style={{ padding: '96px 64px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center' }}>
        <div>
          <p style={{ fontFamily: 'monospace', fontSize: '13px', letterSpacing: '0.2em', color: '#A8542F', marginBottom: '20px', textTransform: 'uppercase' }}>
            Über uns
          </p>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '40px', lineHeight: '1.15', fontWeight: 400, color: '#16242B', marginBottom: '24px' }}>
            {about.title}
          </h1>
          <p style={{ fontSize: '17px', color: '#5A5448', lineHeight: '1.7' }}>
            {about.body}
          </p>
        </div>
        <div style={{ backgroundColor: '#D5CEBC', borderRadius: '16px', aspectRatio: '4/3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '48px' }}>🕌</span>
        </div>
      </section>

      {/* Why Makarim */}
      <section style={{ padding: '80px 64px', backgroundColor: 'white' }}>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '30px', fontWeight: 400, color: '#16242B', marginBottom: '16px' }}>
          {about.whyTitle}
        </h2>
        <p style={{ fontSize: '17px', color: '#5A5448', lineHeight: '1.7', maxWidth: '700px', marginBottom: '48px' }}>
          {about.whyBody}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
          {about.tiles.map((tile, i) => (
            <div key={i} style={{ backgroundColor: '#F7ECE4', borderRadius: '12px', padding: '28px' }}>
              <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: 400, color: '#16242B', marginBottom: '10px' }}>
                {tile.t}
              </h3>
              <p style={{ fontSize: '15px', color: '#5A5448', lineHeight: '1.6' }}>{tile.b}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
