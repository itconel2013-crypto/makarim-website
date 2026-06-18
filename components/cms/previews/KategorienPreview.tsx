'use client';

import { useCMS } from '../CMSProvider';

const CAT_COLORS: Record<string, string> = {
  umrah:        'linear-gradient(135deg, #C2724A33, #F0CDA833)',
  hajj:         'linear-gradient(135deg, #3E6B5233, #9DB0AD33)',
  kulturreisen: 'linear-gradient(135deg, #16242B33, #3A4C5533)',
};

export function KategorienPreview() {
  const { store } = useCMS();
  if (!store) return null;

  const { categories } = store.c;

  return (
    <div style={{ fontFamily: "'Schibsted Grotesk', sans-serif", backgroundColor: 'white', padding: '80px 64px' }}>
      <p style={{ fontFamily: 'monospace', fontSize: '13px', letterSpacing: '0.2em', color: '#A8542F', textAlign: 'center', marginBottom: '16px', textTransform: 'uppercase' }}>
        Unsere Kategorien
      </p>
      <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '42px', lineHeight: '1.2', fontWeight: 400, color: '#16242B', textAlign: 'center', marginBottom: '16px' }}>
        Finde deine perfekte Reise
      </h2>
      <p style={{ fontSize: '18px', color: '#5A5448', textAlign: 'center', marginBottom: '56px', maxWidth: '600px', margin: '0 auto 56px' }}>
        Von der kleinen Pilgerfahrt bis zur großen Kulturreise — wir begleiten dich.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
        {categories.map((cat) => (
          <div key={cat.key} style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 6px 22px rgba(40,30,20,0.05)' }}>
            <div style={{ aspectRatio: '4/3', background: CAT_COLORS[cat.key] ?? '#EAE3D8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '64px' }}>{cat.icon ?? '🕌'}</span>
            </div>
            <div style={{ backgroundColor: 'white', padding: '24px' }}>
              <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '24px', fontWeight: 400, color: '#16242B', marginBottom: '12px' }}>
                {cat.title}
              </h3>
              <p style={{ fontSize: '14px', color: '#6B6457', marginBottom: '24px', lineHeight: '1.6' }}>
                {cat.text}
              </p>
              <span style={{ display: 'block', backgroundColor: '#C2724A', color: 'white', height: '48px', lineHeight: '48px', borderRadius: '9px', textAlign: 'center', fontSize: '15px', fontWeight: 500 }}>
                Jetzt entdecken
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
