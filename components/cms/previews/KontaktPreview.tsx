'use client';

import { useCMS } from '../CMSProvider';

export function KontaktPreview() {
  const { store } = useCMS();
  if (!store) return null;

  const { brand, cta } = store.c;

  return (
    <div style={{ fontFamily: "'Schibsted Grotesk', sans-serif", backgroundColor: '#F4F1EA' }}>
      {/* CTA Band */}
      <section style={{ padding: '80px 64px' }}>
        <div style={{ backgroundColor: '#16242B', borderRadius: '24px', padding: '56px 64px', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '40px', lineHeight: '1.2', fontWeight: 400, color: '#F4F1EA', marginBottom: '16px' }}>
            {cta.headline}
          </h2>
          <p style={{ fontSize: '18px', color: '#9DB0AD', marginBottom: '40px' }}>{cta.sub}</p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <span style={{ display: 'inline-block', backgroundColor: '#C2724A', color: 'white', height: '54px', lineHeight: '54px', borderRadius: '13px', padding: '0 32px', fontSize: '16px', fontWeight: 500 }}>
              {cta.btnCall}
            </span>
            <span style={{ display: 'inline-block', border: '1.5px solid rgba(255,255,255,0.4)', backgroundColor: 'rgba(255,255,255,0.08)', color: 'white', height: '54px', lineHeight: '54px', borderRadius: '13px', padding: '0 32px', fontSize: '16px', fontWeight: 500 }}>
              {cta.btnWrite}
            </span>
          </div>
        </div>
      </section>

      {/* Footer preview */}
      <footer style={{ backgroundColor: '#16242B', padding: '56px 64px 32px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '48px' }}>
        <div>
          <div style={{ width: '120px', height: '36px', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '6px', marginBottom: '16px' }} />
          <p style={{ fontSize: '14px', color: '#9DB0AD', lineHeight: '1.6' }}>
            {brand.address1}<br />{brand.address2}
          </p>
        </div>
        <div>
          <p style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace', marginBottom: '16px' }}>Navigation</p>
          {['Umrah', 'Hajj', 'Kulturreisen', 'Über uns', 'FAQ'].map((l) => (
            <p key={l} style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', marginBottom: '8px' }}>{l}</p>
          ))}
        </div>
        <div>
          <p style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace', marginBottom: '16px' }}>Kontakt</p>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', marginBottom: '8px' }}>{brand.phone}</p>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', marginBottom: '8px' }}>{brand.email}</p>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)' }}>{brand.instagram}</p>
        </div>
        <div>
          <p style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace', marginBottom: '16px' }}>Bankverbindung</p>
          <p style={{ fontFamily: 'monospace', fontSize: '12px', color: '#9DB0AD', marginBottom: '6px' }}>{brand.bank.iban}</p>
          <p style={{ fontFamily: 'monospace', fontSize: '12px', color: '#9DB0AD', marginBottom: '6px' }}>{brand.bank.bic}</p>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)' }}>{brand.bank.name}</p>
        </div>
      </footer>
    </div>
  );
}
