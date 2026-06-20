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
                <div style={iconBox('#E4F6EA')}>
                  <svg viewBox="0 0 24 24" width="23" height="23" fill="#25A957">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
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
