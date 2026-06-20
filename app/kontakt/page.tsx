import { loadContent } from '@/lib/db';
import { KontaktForm } from '@/components/kontakt/KontaktForm';

export const metadata = { title: 'Kontakt — Makarim Reisen' };

const iconBox = (bg: string) => ({
  width: '46px', height: '46px', borderRadius: '13px', flexShrink: 0,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  backgroundColor: bg,
});

export default async function KontaktPage() {
  const content = await loadContent();
  const { brand } = content.c;

  return (
    <main>
      <section className="py-section" style={{ backgroundColor: '#F4F1EA' }}>
        <div className="container-max">
          <p className="font-mono uppercase mb-4" style={{ fontSize: '13px', letterSpacing: '0.2em', color: '#A8542F' }}>
            Kontakt
          </p>
          <h1 className="font-serif font-normal text-ink mb-5" style={{ fontSize: 'clamp(28px, 4vw, 44px)', lineHeight: '1.15' }}>
            {brand.kontaktHeading ?? 'Wir sind für dich da'}
          </h1>
          <p className="mb-14" style={{ fontSize: '16.5px', color: '#5A5448', lineHeight: '1.7', maxWidth: '520px' }}>
            {brand.kontaktIntro ?? 'Hast du eine Frage zu einer Reise, möchtest dich beraten lassen oder brauchst Hilfe bei deiner Buchung? Schreib uns – wir melden uns persönlich bei dir.'}
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

            {/* Left — Kontaktdaten */}
            <div className="space-y-4">

              {/* Telefon */}
              <a href={`tel:${brand.phone}`} className="flex items-center gap-5 p-6 bg-white rounded-card hover:shadow-card transition-shadow" style={{ border: '1px solid #EAE3D8' }}>
                <div style={iconBox('#F0E4DC')}>
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#A8542F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-mono uppercase tracking-widest text-body-light mb-1">Telefon</p>
                  <p className="font-medium text-ink">{brand.phone}</p>
                </div>
              </a>

              {/* WhatsApp */}
              <a href={`https://wa.me/${brand.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-5 p-6 bg-white rounded-card hover:shadow-card transition-shadow" style={{ border: '1px solid #EAE3D8' }}>
                <div style={{ width: '46px', height: '46px', borderRadius: '50%', backgroundColor: '#25D366', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg viewBox="0 0 24 24" width="27" height="27" fill="#fff">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.26 8.26 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.23 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.51.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-mono uppercase tracking-widest text-body-light mb-1">WhatsApp</p>
                  <p className="font-medium text-ink">Nachricht schreiben</p>
                </div>
              </a>

              {/* E-Mail */}
              <a href={`mailto:${brand.email}`} className="flex items-center gap-5 p-6 bg-white rounded-card hover:shadow-card transition-shadow" style={{ border: '1px solid #EAE3D8' }}>
                <div style={iconBox('#F0E4DC')}>
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#A8542F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-10 6L2 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-mono uppercase tracking-widest text-body-light mb-1">E-Mail</p>
                  <p className="font-medium text-ink">{brand.email}</p>
                </div>
              </a>

              {/* Instagram */}
              {brand.instagram && (
                <a href={`https://instagram.com/${brand.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-5 p-6 bg-white rounded-card hover:shadow-card transition-shadow" style={{ border: '1px solid #EAE3D8' }}>
                  <div style={iconBox('#F0E4DC')}>
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#A8542F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" />
                      <circle cx="12" cy="12" r="4" />
                      <path d="M17.5 6.5h.01" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-mono uppercase tracking-widest text-body-light mb-1">Instagram</p>
                    <p className="font-medium text-ink">{brand.instagram}</p>
                  </div>
                </a>
              )}

              {/* Büro */}
              <div className="flex items-center gap-5 p-6 rounded-card" style={{ backgroundColor: '#16242B' }}>
                <div style={{ ...iconBox('rgba(244,241,234,0.1)') }}>
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#F0CDA8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: 'rgba(244,241,234,0.5)' }}>Büro</p>
                  <p className="font-medium" style={{ color: '#F4F1EA' }}>{brand.address1}</p>
                  <p className="text-sm" style={{ color: 'rgba(244,241,234,0.6)' }}>{brand.address2}</p>
                </div>
              </div>

            </div>

            {/* Right — Kontaktformular */}
            <div className="p-8 bg-white rounded-card" style={{ border: '1px solid #EAE3D8' }}>
              <KontaktForm />
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}
