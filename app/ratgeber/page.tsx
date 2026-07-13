import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { loadContent } from '@/lib/db';
import { Guide } from '@/lib/content-schema';

export async function generateMetadata(): Promise<Metadata> {
  const content = await loadContent();
  return {
    title: `Ratgeber — Duas, Packliste & Vorbereitung | ${content.c.seo.siteName}`,
    description:
      'Bittgebete (Duas), Packliste und praktische Tipps zur Vorbereitung deiner Umrah- oder Hajj-Reise — verständlich erklärt.',
  };
}

export default async function RatgeberPage() {
  const content = await loadContent();
  const guides: Guide[] = (content.c.guides ?? []).filter((g) => g.published !== false);
  const faq = content.c.faq ?? [];

  return (
    <main className="min-h-screen bg-page">
      {/* ── Kopfbereich ─────────────────────────────────────────────── */}
      <section className="py-section" style={{ backgroundColor: '#F4F1EA' }}>
        <div className="container-max" style={{ maxWidth: '900px' }}>
          <p className="font-mono uppercase mb-4" style={{ fontSize: '13px', letterSpacing: '0.2em', color: '#A8542F' }}>
            Ratgeber
          </p>
          <h1 className="font-serif font-normal text-ink mb-5" style={{ fontSize: 'clamp(28px, 4vw, 44px)', lineHeight: '1.15' }}>
            Gut vorbereitet auf deine Reise
          </h1>
          <p className="text-body" style={{ fontSize: '17px', lineHeight: 1.7, maxWidth: '640px' }}>
            Bittgebete (Duas), Packliste und alles, was du vor deiner Umrah oder Hajj wissen solltest —
            klar erklärt und in Ruhe nachlesbar.
          </p>
        </div>
      </section>

      {/* ── Artikel ─────────────────────────────────────────────────── */}
      <section className="py-section">
        <div className="container-max" style={{ maxWidth: '900px' }}>
          {guides.length === 0 ? (
            <div className="rounded-card bg-white p-10 text-center" style={{ border: '1px solid #EAE3D8' }}>
              <p className="text-body-light">Die ersten Ratgeber-Beiträge sind in Arbeit — schau bald wieder vorbei.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {guides.map((g) => (
                <Link
                  key={g.id}
                  href={`/ratgeber/${g.slug}`}
                  className="group block overflow-hidden rounded-card bg-white transition-shadow hover:shadow-card-lg"
                  style={{ border: '1px solid #EAE3D8', boxShadow: '0 6px 22px rgba(40,30,20,0.05)', textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="relative overflow-hidden bg-page h-44">
                    {g.image ? (
                      <Image src={g.image} alt={g.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #F0E4DC, #EAE3D8)' }}>
                        <span style={{ fontSize: '38px', opacity: 0.5 }}>📖</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h2 className="font-serif font-normal text-ink mb-2" style={{ fontSize: '21px', lineHeight: 1.25 }}>
                      {g.title}
                    </h2>
                    <p className="text-body" style={{ fontSize: '14.5px', lineHeight: 1.6 }}>
                      {g.excerpt}
                    </p>
                    <span className="inline-block mt-4 font-medium" style={{ fontSize: '14px', color: '#A8542F' }}>
                      Weiterlesen →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* ── FAQ: liegt weiter unter /faq (SEO), wird hier prominent verlinkt ── */}
          {faq.length > 0 && (
            <div
              className="mt-12 rounded-card bg-white p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5"
              style={{ border: '1px solid #EAE3D8' }}
            >
              <div>
                <h2 className="font-serif font-normal text-ink mb-1" style={{ fontSize: '22px' }}>
                  Häufige Fragen
                </h2>
                <p className="text-body" style={{ fontSize: '15px' }}>
                  Antworten auf die {faq.length} meistgestellten Fragen zu unseren Reisen.
                </p>
              </div>
              <Link
                href="/faq"
                className="inline-flex items-center justify-center font-medium text-white flex-shrink-0"
                style={{ backgroundColor: '#C2724A', height: '48px', borderRadius: '11px', padding: '0 26px', fontSize: '15px' }}
              >
                Zu den FAQ
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
