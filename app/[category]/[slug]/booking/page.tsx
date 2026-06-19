import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { loadContent } from '@/lib/db';
import { BookingForm } from '@/components/website/BookingForm';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const content = await loadContent();
  const trip = content.c.trips.find((t) => t.slug === slug && t.published !== false);
  if (!trip) return {};
  return { title: `Anfrage: ${trip.title} | ${content.c.seo.siteName}` };
}

export default async function BookingPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const content = await loadContent();

  const trip = content.c.trips.find(
    (t) => t.slug === slug && t.category === category && t.published !== false
  );
  if (!trip) notFound();

  return (
    <main className="min-h-screen bg-page">
      <div className="container-max py-12">

        {/* Back link */}
        <Link
          href={`/${category}/${slug}`}
          className="inline-flex items-center gap-2 text-sm text-body hover:text-primary transition-colors mb-8"
        >
          ← Zurück zur Reise
        </Link>

        {/* Heading */}
        <p style={{ fontFamily: 'monospace', fontSize: '12px', letterSpacing: '0.18em', color: '#A8542F', textTransform: 'uppercase', marginBottom: '10px' }}>Buchungsanfrage</p>
        <h1
          className="font-serif font-normal text-ink mb-2"
          style={{ fontSize: '38px', lineHeight: '1.2' }}
        >
          {trip.title}
        </h1>
        <p className="font-mono font-semibold text-body-dark mb-10 tabular-nums" style={{ fontSize: '13.5px' }}>
          {trip.date} · {trip.nights + 1} Tage · {trip.nights} Nächte
        </p>

        <BookingForm trip={trip} brand={content.c.brand} />
      </div>
    </main>
  );
}
