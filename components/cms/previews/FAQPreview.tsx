'use client';

import { useCMS } from '../CMSProvider';

export function FAQPreview() {
  const { store } = useCMS();
  if (!store) return null;

  const faq = store.c.faq.slice(0, 6);

  return (
    <div style={{ fontFamily: "'Schibsted Grotesk', sans-serif", backgroundColor: '#F4F1EA', padding: '80px 64px' }}>
      <p style={{ fontFamily: 'monospace', fontSize: '13px', letterSpacing: '0.2em', color: '#A8542F', textAlign: 'center', marginBottom: '16px', textTransform: 'uppercase' }}>
        Häufige Fragen
      </p>
      <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '42px', lineHeight: '1.2', fontWeight: 400, color: '#16242B', textAlign: 'center', marginBottom: '56px' }}>
        Wir haben Antworten
      </h2>

      <div style={{ maxWidth: '820px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {faq.map((item, i) => (
          <div key={i} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px 28px', border: '1px solid #EAE3D8' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: 400, color: '#16242B', lineHeight: '1.4', flex: 1 }}>
                {item.q || <span style={{ color: '#9A9082' }}>(Frage leer)</span>}
              </p>
              <span style={{ color: '#C2724A', fontSize: '20px', flexShrink: 0, marginTop: '2px' }}>{i === 0 ? '−' : '+'}</span>
            </div>
            {i === 0 && item.a && (
              <p style={{ fontSize: '15px', color: '#5A5448', marginTop: '16px', lineHeight: '1.65', borderTop: '1px solid #EAE3D8', paddingTop: '16px' }}>
                {item.a}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
