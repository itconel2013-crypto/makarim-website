'use client';

import { useCMS } from '../CMSProvider';

export function KategorienPreview() {
  const { store } = useCMS();
  if (!store) return null;

  const { categories } = store.c;

  return (
    <div style={{ fontFamily: "'Schibsted Grotesk', sans-serif", backgroundColor: 'white', padding: '22px 20px' }}>
      <div style={{ fontFamily: "'Newsreader', serif", fontSize: '22px', color: '#16242B', textAlign: 'center', marginBottom: '18px' }}>
        Finde deine perfekte Reise
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {categories.map((cat) => (
          <div key={cat.key} style={{ background: '#fff', border: '1px solid #EAE3D8', borderRadius: '14px', overflow: 'hidden' }}>
            <div style={{ height: '120px', background: '#F4F1EA', overflow: 'hidden' }}>
              {cat.imageUrl ? (
                <img src={cat.imageUrl} alt={cat.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '40px', opacity: 0.3 }}>{cat.icon ?? '🕌'}</span>
                </div>
              )}
            </div>
            <div style={{ padding: '14px 16px' }}>
              <div style={{ fontFamily: "'Newsreader', serif", fontSize: '18px', color: '#16242B', marginBottom: '6px' }}>
                {cat.title}
              </div>
              <p style={{ fontSize: '12.5px', lineHeight: 1.5, color: '#6B6457', margin: '0 0 12px' }}>
                {cat.text}
              </p>
              <span style={{ display: 'inline-block', background: '#C2724A', color: '#fff', fontSize: '12px', fontWeight: 600, borderRadius: '9px', padding: '8px 14px' }}>
                Jetzt entdecken
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
