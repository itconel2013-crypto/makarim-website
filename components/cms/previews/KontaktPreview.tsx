'use client';

import { useCMS } from '../CMSProvider';

export function KontaktPreview() {
  const { store } = useCMS();
  if (!store) return null;

  const { brand, cta } = store.c;

  return (
    <div style={{ fontFamily: "'Schibsted Grotesk', sans-serif", backgroundColor: '#F4F1EA' }}>

      {/* CTA Band */}
      <section style={{ padding: '28px 24px' }}>
        <div style={{ backgroundColor: '#16242B', borderRadius: '16px', padding: '28px 24px', textAlign: 'center' }}>
          <div style={{ fontFamily: "'Newsreader', serif", fontSize: '22px', fontWeight: 400, color: '#F4F1EA', marginBottom: '9px' }}>
            {cta.headline}
          </div>
          <p style={{ fontSize: '13px', color: '#9DB0AD', margin: '0 auto 18px', maxWidth: '300px', lineHeight: 1.55 }}>
            {cta.sub}
          </p>
          <div style={{ display: 'flex', gap: '9px', justifyContent: 'center' }}>
            <span style={{ background: '#C2724A', color: '#fff', fontSize: '12.5px', fontWeight: 600, borderRadius: '9px', padding: '9px 16px' }}>
              {cta.btnCall}
            </span>
            <span style={{ background: 'transparent', border: '1px solid rgba(244,241,234,0.35)', color: '#F4F1EA', fontSize: '12.5px', fontWeight: 600, borderRadius: '9px', padding: '9px 16px' }}>
              {cta.btnWrite}
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#16242B', padding: '28px 24px', textAlign: 'center' }}>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '18px', display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12.5px', color: '#9DB0AD' }}>
          <span style={{ color: '#E6EAE9', fontWeight: 600, marginBottom: '4px' }}>Makarim &amp; Soultreat</span>
          <span>{brand.address1} · {brand.address2}</span>
          <span>{brand.phone} · {brand.email}</span>
          <span>{brand.instagram}</span>
        </div>

        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', textAlign: 'left' }}>
          <div>
            <p style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', marginBottom: '10px' }}>Navigation</p>
            {['Umrah', 'Hajj', 'Kulturreisen', 'Über uns', 'FAQ'].map((l) => (
              <p key={l} style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>{l}</p>
            ))}
          </div>
          <div>
            <p style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', marginBottom: '10px' }}>Bankverbindung</p>
            <p style={{ fontFamily: 'monospace', fontSize: '11px', color: '#9DB0AD', marginBottom: '5px', wordBreak: 'break-all' }}>{brand.bank.iban}</p>
            <p style={{ fontFamily: 'monospace', fontSize: '11px', color: '#9DB0AD', marginBottom: '5px' }}>{brand.bank.bic}</p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{brand.bank.name}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
