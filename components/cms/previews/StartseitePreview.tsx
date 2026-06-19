'use client';

import { useCMS } from '../CMSProvider';

export function StartseitePreview() {
  const { store } = useCMS();
  if (!store) return null;

  const { home } = store.c;

  return (
    <div style={{ fontFamily: "'Schibsted Grotesk', sans-serif", backgroundColor: '#F4F1EA' }}>

      {/* Hero */}
      <div style={{ position: 'relative', height: '260px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', background: '#2a2018' }}>
        {home.heroUrl && (
          <img src={home.heroUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(22,16,10,0.35),rgba(22,16,10,0.72))' }} />
        <div style={{ position: 'relative', padding: '0 26px' }}>
          <div style={{ fontSize: '11px', letterSpacing: '0.06em', color: '#F0CDA8', marginBottom: '9px', textTransform: 'uppercase' }}>
            {home.kicker}
          </div>
          <div style={{ fontFamily: "'Newsreader', serif", fontSize: '30px', fontWeight: 500, color: '#fff', lineHeight: 1.1, marginBottom: '11px' }}>
            {home.headline}
          </div>
          <p style={{ fontSize: '12.5px', lineHeight: 1.5, color: 'rgba(255,255,255,0.9)', margin: '0 0 16px' }}>
            {home.sub}
          </p>
          <div style={{ display: 'flex', gap: '9px', justifyContent: 'center' }}>
            <span style={{ background: '#C2724A', color: '#fff', fontSize: '12.5px', fontWeight: 600, borderRadius: '9px', padding: '9px 16px' }}>
              {home.btnP || 'Reisen entdecken'}
            </span>
            <span style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.6)', color: '#fff', fontSize: '12.5px', fontWeight: 600, borderRadius: '9px', padding: '9px 16px' }}>
              {home.btnS || 'Mehr erfahren'}
            </span>
          </div>
        </div>
      </div>

      {/* Trust / Vier Gründe */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', background: '#F8F5EF', borderTop: '1px solid #E9E2D5' }}>
        {home.trust.map((card, i) => (
          <div key={i} style={{ padding: '16px 10px', textAlign: 'center', borderRight: i < 3 ? '1px solid #ECE5D8' : undefined }}>
            <div style={{ fontFamily: "'Newsreader', serif", fontSize: '14px', color: '#16242B', fontWeight: 500, marginBottom: '4px' }}>
              {card.value}
            </div>
            <div style={{ fontSize: '10.5px', color: '#7C746A', lineHeight: 1.3 }}>
              {card.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
