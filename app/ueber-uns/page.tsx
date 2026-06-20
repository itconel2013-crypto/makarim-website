import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { loadContent } from '@/lib/db';

export async function generateMetadata(): Promise<Metadata> {
  const content = await loadContent();
  const seo = content.c.seo.about;
  return {
    title: seo?.title ?? content.c.seo.siteName,
    description: seo?.desc ?? content.c.seo.defaultDesc,
  };
}

export default async function AboutPage() {
  const content = await loadContent();
  const about = content.c.about;
  const brand = content.c.brand;

  return (
    <main className="min-h-screen bg-page">

      {/* ── Back link ──────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-border-light">
        <div className="container-max py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-body hover:text-primary transition-colors"
          >
            ← Zurück zur Startseite
          </Link>
        </div>
      </div>

      {/* ── Two-column intro ────────────────────────────────────────────── */}
      <section className="py-section bg-white">
        <div className="container-max">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

            {/* Text — left */}
            <div>
              <p
                className="font-mono uppercase mb-5"
                style={{ fontSize: '13px', letterSpacing: '0.2em', color: '#A8542F' }}
              >
                Über uns
              </p>
              <h1
                className="font-serif font-normal text-ink mb-6"
                style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: '1.2' }}
              >
                {about.title}
              </h1>
              <p
                className="leading-relaxed"
                style={{ fontSize: '16.5px', color: '#5A5448', lineHeight: '1.75' }}
              >
                {about.body}
              </p>
            </div>

            {/* Image collage — right */}
            <div className="relative hidden lg:block" style={{ height: '540px' }}>
              {/* Bild 1 — hinten, oben links */}
              {about.url ? (
                <div
                  className="absolute rounded-card overflow-hidden shadow-card-lg"
                  style={{ top: 0, left: 0, width: '86%', aspectRatio: '3/2' }}
                >
                  <Image
                    src={about.url}
                    alt="Makarim – Pilgerreisen mit Seele"
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div
                  className="absolute rounded-card"
                  style={{ top: 0, left: 0, width: '86%', aspectRatio: '3/2', backgroundColor: '#F0E4DC' }}
                />
              )}

              {/* Bild 2 — vorne, unten rechts */}
              {about.url2 ? (
                <div
                  className="absolute rounded-card overflow-hidden shadow-card-lg"
                  style={{ bottom: '10%', right: 0, width: '78%', aspectRatio: '3/2', border: '8px solid white' }}
                >
                  <Image
                    src={about.url2}
                    alt="Makarim Team"
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div
                  className="absolute rounded-card"
                  style={{ bottom: '10%', right: 0, width: '78%', aspectRatio: '3/2', border: '8px solid white', backgroundColor: '#EAE3D8' }}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Warum Makarim? ──────────────────────────────────────────────── */}
      <section className="py-section bg-page">
        <div className="container-max">
          <div className="max-w-2xl mx-auto text-center mb-14">
            <h2
              className="font-serif font-normal text-ink mb-5"
              style={{ fontSize: '30px' }}
            >
              {about.whyTitle}
            </h2>
            <p style={{ fontSize: '16.5px', color: '#5A5448', lineHeight: '1.75' }}>
              {about.whyBody}
            </p>
          </div>

          {/* 2-col tiles grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {about.tiles.map((tile, i) => (
              <div
                key={i}
                className="p-8 rounded-card"
                style={{ backgroundColor: '#F7ECE4' }}
              >
                <h3
                  className="font-serif font-normal text-ink mb-3"
                  style={{ fontSize: '22px' }}
                >
                  {tile.t}
                </h3>
                <p className="text-body-sm" style={{ color: '#6B6457', lineHeight: '1.65' }}>
                  {tile.b}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA band ────────────────────────────────────────────────────── */}
      <section className="py-section bg-white">
        <div className="container-max">
          <div
            className="text-center text-white px-10 py-16 rounded-band"
            style={{ backgroundColor: '#16242B' }}
          >
            <h2
              className="font-serif font-normal mb-5"
              style={{ fontSize: '36px', color: '#F4F1EA' }}
            >
              Bereit für deine spirituelle Reise?
            </h2>
            <p className="mb-10 max-w-lg mx-auto" style={{ fontSize: '17px', color: '#9DB0AD', lineHeight: '1.7' }}>
              Ruf uns an oder schreib uns — wir beraten dich persönlich und kostenlos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={`tel:${brand.phone}`}
                className="inline-flex items-center justify-center font-medium text-white transition-colors"
                style={{ backgroundColor: '#C2724A', height: '54px', borderRadius: '13px', padding: '0 32px', fontSize: '16px' }}
              >
                {brand.phone}
              </a>
              <a
                href={`mailto:${brand.email}`}
                className="inline-flex items-center justify-center font-medium text-white transition-colors"
                style={{ height: '54px', borderRadius: '13px', padding: '0 32px', fontSize: '16px', border: '1.5px solid rgba(255,255,255,0.3)', backgroundColor: 'rgba(255,255,255,0.08)' }}
              >
                {brand.email}
              </a>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
