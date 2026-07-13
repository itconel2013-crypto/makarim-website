import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { loadContent } from '@/lib/db';
import { Guide } from '@/lib/content-schema';
import { truncateText } from '@/lib/utils';

async function findGuide(slug: string): Promise<Guide | undefined> {
  const content = await loadContent();
  return (content.c.guides ?? []).find((g) => g.slug === slug && g.published !== false);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const content = await loadContent();
  const guide = await findGuide(slug);
  if (!guide) return {};

  const title = guide.seoTitle || `${guide.title} | ${content.c.seo.siteName}`;
  const description = guide.seoDesc || truncateText(guide.excerpt || guide.intro, 158) || content.c.seo.defaultDesc;
  return { title, description };
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = await findGuide(slug);
  if (!guide) notFound();

  // Strukturierte Daten: hilft Google, den Artikel als Ratgeber zu verstehen.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.seoDesc || guide.excerpt,
    ...(guide.image ? { image: guide.image } : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="min-h-screen bg-page">
        <article className="py-section">
          <div className="container-max" style={{ maxWidth: '760px' }}>
            <Link
              href="/ratgeber"
              className="inline-flex items-center gap-2 text-sm text-body hover:text-primary transition-colors mb-8"
            >
              ← Zurück zum Ratgeber
            </Link>

            <p className="font-mono uppercase mb-3" style={{ fontSize: '12px', letterSpacing: '0.2em', color: '#A8542F' }}>
              Ratgeber
            </p>
            <h1 className="font-serif font-normal text-ink mb-6" style={{ fontSize: 'clamp(26px, 4vw, 40px)', lineHeight: '1.15' }}>
              {guide.title}
            </h1>

            {guide.image && (
              <div className="relative overflow-hidden rounded-card mb-8 h-56 sm:h-72" style={{ border: '1px solid #EAE3D8' }}>
                <Image src={guide.image} alt={guide.title} fill className="object-cover" priority />
              </div>
            )}

            {guide.intro?.trim() && (
              <p className="text-body mb-8" style={{ fontSize: '17px', lineHeight: 1.75, whiteSpace: 'pre-line' }}>
                {guide.intro}
              </p>
            )}

            {/* Abschnitte werden als H2 gerendert — gute Struktur für Leser und Google */}
            {guide.sections?.map((s, i) => (
              <section key={i} className="mb-8">
                {s.heading?.trim() && (
                  <h2 className="font-serif font-normal text-ink mb-3" style={{ fontSize: 'clamp(21px, 3vw, 27px)', lineHeight: 1.25 }}>
                    {s.heading}
                  </h2>
                )}
                {s.body?.trim() && (
                  <p className="text-body" style={{ fontSize: '16px', lineHeight: 1.75, whiteSpace: 'pre-line' }}>
                    {s.body}
                  </p>
                )}
              </section>
            ))}

            {/* Abschluss-CTA */}
            <div
              className="mt-12 rounded-card bg-white p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5"
              style={{ border: '1px solid #EAE3D8' }}
            >
              <div>
                <h2 className="font-serif font-normal text-ink mb-1" style={{ fontSize: '21px' }}>
                  Bereit für deine Reise?
                </h2>
                <p className="text-body" style={{ fontSize: '15px' }}>
                  Entdecke unsere Umrah- und Hajj-Reisen.
                </p>
              </div>
              <Link
                href="/umrah"
                className="inline-flex items-center justify-center font-medium text-white flex-shrink-0"
                style={{ backgroundColor: '#C2724A', height: '48px', borderRadius: '11px', padding: '0 26px', fontSize: '15px' }}
              >
                Reisen ansehen
              </Link>
            </div>
          </div>
        </article>
      </main>
    </>
  );
}
