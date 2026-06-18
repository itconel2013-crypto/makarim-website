import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { loadContent } from '@/lib/db';
import { TripCard } from '@/components/website/TripCard';

type CategoryKey = 'umrah' | 'hajj' | 'kulturreisen';

const validCategories: CategoryKey[] = ['umrah', 'hajj', 'kulturreisen'];

const typMap: Record<CategoryKey, 'Umrah' | 'Hajj' | 'Kulturreisen'> = {
  umrah: 'Umrah',
  hajj: 'Hajj',
  kulturreisen: 'Kulturreisen',
};

const seoKeyMap: Record<CategoryKey, 'umrah' | 'hajj' | 'kultur'> = {
  umrah: 'umrah',
  hajj: 'hajj',
  kulturreisen: 'kultur',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const cat = category as CategoryKey;
  if (!validCategories.includes(cat)) return {};

  const content = await loadContent();
  const seo = content.c.seo[seoKeyMap[cat]];

  return {
    title: seo?.title ?? content.c.seo.siteName,
    description: seo?.desc ?? content.c.seo.defaultDesc,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = category as CategoryKey;

  if (!validCategories.includes(cat)) {
    notFound();
  }

  const content = await loadContent();
  const typ = typMap[cat];

  const categoryData = content.c.categories.find((c) => c.key === cat);
  if (!categoryData) notFound();

  const trips = content.c.trips.filter(
    (t) => t.published !== false && t.typ === typ
  );

  return (
    <main className="min-h-screen bg-page">
      {/* Category header */}
      <section className="bg-white border-b border-border-light">
        <div className="container-max py-14">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-body hover:text-primary transition-colors mb-8"
          >
            ← Zurück zur Startseite
          </Link>

          <p className="text-kicker font-mono text-primary-dark uppercase mb-4 tracking-widest">
            Alle Termine
          </p>

          <h1
            className="font-serif font-normal text-ink mb-6"
            style={{ fontSize: 'clamp(28px, 4vw, 46px)', lineHeight: '1.2' }}
          >
            {categoryData.title}
          </h1>

          <p className="text-body-lg text-body-dark max-w-2xl leading-relaxed">
            {categoryData.text}
          </p>
        </div>
      </section>

      {/* Trips grid */}
      <section className="py-section">
        <div className="container-max">
          {trips.length === 0 ? (
            <div className="text-center py-20 px-8 bg-white rounded-card shadow-card max-w-xl mx-auto">
              <p className="text-kicker font-mono text-primary-dark uppercase mb-4 tracking-widest">
                Demnächst
              </p>
              <h2 className="font-serif font-normal text-ink text-3xl mb-4">
                Bald verfügbar
              </h2>
              <p className="text-body text-body-dark mb-8">
                Wir arbeiten gerade an neuen Angeboten für {categoryData.title}.
                Melde dich direkt bei uns — wir beraten dich gerne.
              </p>
              <Link
                href="/"
                className="inline-block bg-primary text-white rounded-button-md px-8 py-3 font-medium hover:bg-primary-dark transition-colors"
              >
                Zur Startseite
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {trips.map((trip) => (
                <TripCard key={trip.vg} trip={trip} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
