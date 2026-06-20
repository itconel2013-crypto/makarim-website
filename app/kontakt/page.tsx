import { loadContent } from '@/lib/db';
import { KontaktForm } from '@/components/kontakt/KontaktForm';

export const metadata = { title: 'Kontakt — Makarim Reisen' };

export default async function KontaktPage() {
  const content = await loadContent();
  const { brand } = content.c;

  return (
    <main>
      <section className="py-section" style={{ backgroundColor: '#F4F1EA' }}>
        <div className="container-max">
          <p className="font-mono uppercase mb-4" style={{ fontSize: '13px', letterSpacing: '0.2em', color: '#A8542F' }}>
            Wir sind für dich da
          </p>
          <h1 className="font-serif font-normal text-ink mb-14" style={{ fontSize: 'clamp(28px, 4vw, 44px)', lineHeight: '1.15' }}>
            Kontakt aufnehmen
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

            {/* Left — Kontaktdaten */}
            <div className="space-y-4">
              <a
                href={`tel:${brand.phone}`}
                className="flex items-center gap-5 p-6 bg-white rounded-card hover:shadow-card transition-shadow"
                style={{ border: '1px solid #EAE3D8' }}
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#F0E4DC' }}>
                  <span style={{ fontSize: '20px' }}>📞</span>
                </div>
                <div>
                  <p className="text-xs font-mono uppercase tracking-widest text-body-light mb-1">Telefon</p>
                  <p className="font-medium text-ink">{brand.phone}</p>
                </div>
              </a>

              <a
                href={`https://wa.me/${brand.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-5 p-6 bg-white rounded-card hover:shadow-card transition-shadow"
                style={{ border: '1px solid #EAE3D8' }}
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#EAF5EE' }}>
                  <span style={{ fontSize: '20px' }}>💬</span>
                </div>
                <div>
                  <p className="text-xs font-mono uppercase tracking-widest text-body-light mb-1">WhatsApp</p>
                  <p className="font-medium text-ink">Nachricht schreiben</p>
                </div>
              </a>

              <a
                href={`mailto:${brand.email}`}
                className="flex items-center gap-5 p-6 bg-white rounded-card hover:shadow-card transition-shadow"
                style={{ border: '1px solid #EAE3D8' }}
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#F0E4DC' }}>
                  <span style={{ fontSize: '20px' }}>✉️</span>
                </div>
                <div>
                  <p className="text-xs font-mono uppercase tracking-widest text-body-light mb-1">E-Mail</p>
                  <p className="font-medium text-ink">{brand.email}</p>
                </div>
              </a>

              <div
                className="flex items-center gap-5 p-6 bg-white rounded-card"
                style={{ border: '1px solid #EAE3D8' }}
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#F0E4DC' }}>
                  <span style={{ fontSize: '20px' }}>📍</span>
                </div>
                <div>
                  <p className="text-xs font-mono uppercase tracking-widest text-body-light mb-1">Adresse</p>
                  <p className="font-medium text-ink">{brand.address1}</p>
                  <p className="text-body-light text-sm">{brand.address2}</p>
                </div>
              </div>
            </div>

            {/* Right — Kontaktformular */}
            <div className="p-8 bg-white rounded-card" style={{ border: '1px solid #EAE3D8' }}>
              <h2 className="font-serif font-normal text-ink mb-6" style={{ fontSize: '22px' }}>
                Schreib uns direkt
              </h2>
              <KontaktForm />
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}
