'use client';

import { useCMS } from '../CMSProvider';

export function StartseitePreview() {
  const { store } = useCMS();
  if (!store) return null;

  const { home } = store.c;

  return (
    <div style={{ fontFamily: "'Schibsted Grotesk', sans-serif", backgroundColor: '#F4F1EA' }}>
      {/* Hero */}
      <section
        className="relative flex items-center justify-center"
        style={{
          minHeight: '88vh',
          background: 'linear-gradient(135deg, #16242B 0%, #2A3C42 100%)',
        }}
      >
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, rgba(20,14,8,0.32) 0%, rgba(20,14,8,0.62) 100%)' }}
        />
        <div className="relative text-center text-white px-16" style={{ maxWidth: '760px', margin: '0 auto' }}>
          <p style={{ fontFamily: 'monospace', fontSize: '13px', letterSpacing: '0.2em', color: '#F0CDA8', marginBottom: '24px', textTransform: 'uppercase' }}>
            {home.kicker}
          </p>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '62px', lineHeight: '1.05', fontWeight: 400, color: 'white', marginBottom: '24px' }}>
            {home.headline}
          </h1>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.92)', marginBottom: '48px', lineHeight: '1.6' }}>
            {home.sub}
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <span style={{ display: 'inline-block', backgroundColor: '#C2724A', color: 'white', height: '54px', lineHeight: '54px', borderRadius: '13px', padding: '0 32px', fontSize: '16px', fontWeight: 500 }}>
              {home.btnP || 'Reisen entdecken'}
            </span>
            <span style={{ display: 'inline-block', border: '1.5px solid rgba(255,255,255,0.55)', backgroundColor: 'rgba(255,255,255,0.12)', color: 'white', height: '54px', lineHeight: '54px', borderRadius: '13px', padding: '0 32px', fontSize: '16px', fontWeight: 500 }}>
              {home.btnS || 'Mehr erfahren'}
            </span>
          </div>
        </div>
      </section>

      {/* Trust Cards */}
      <section style={{ padding: '80px 64px', backgroundColor: '#F4F1EA' }}>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '42px', lineHeight: '1.2', fontWeight: 400, color: '#16242B', textAlign: 'center', marginBottom: '64px' }}>
          Vier gute Gründe, mit uns zu reisen
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
          {home.trust.map((card, i) => (
            <div key={i} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '28px', textAlign: 'center', border: '1px solid #EAE3D8', boxShadow: '0 6px 22px rgba(40,30,20,0.05)' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#F0E4DC', color: '#A8542F', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontFamily: 'Georgia, serif', fontSize: '18px' }}>
                {i + 1}
              </div>
              <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: 400, color: '#16242B', marginBottom: '12px' }}>
                {card.value}
              </h3>
              <p style={{ fontSize: '14px', color: '#6B6457' }}>{card.label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
