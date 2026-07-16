import type { MetadataRoute } from 'next';
import { loadContent } from '@/lib/db';
import { Trip, Guide } from '@/lib/content-schema';
import { SITE_URL, categoryPath, tripPath } from '@/lib/utils';

// Zur Laufzeit erzeugen, NICHT beim Build: die DB (Volume) ist beim Build nicht
// verfügbar. Sonst schlägt der Production-Build fehl.
export const dynamic = 'force-dynamic';

/**
 * Sitemap für Google. Statische Seiten + dynamisch alle veröffentlichten Reisen
 * und Ratgeber-Artikel. Alle URLs auf der kanonischen Domain (www.makarim.de).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // DB-Abfrage abgesichert: bei einem Problem bleiben wenigstens die festen Seiten.
  let trips: Trip[] = [];
  let guides: Guide[] = [];
  try {
    const content = await loadContent();
    trips = (content.c.trips ?? []).filter((t) => t.published !== false);
    guides = (content.c.guides ?? []).filter((g) => g.published !== false);
  } catch (e) {
    console.error('sitemap: loadContent fehlgeschlagen, nur statische Seiten:', e);
  }

  const staticPaths: string[] = [
    '',
    categoryPath('umrah'),
    categoryPath('hajj'),
    categoryPath('kulturreisen'),
    '/ratgeber',
    '/galerie',
    '/faq',
    '/ueber-uns',
    '/kontakt',
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((p) => ({
    url: `${SITE_URL}${p}`,
    changeFrequency: 'weekly',
    priority: p === '' ? 1 : 0.8,
  }));

  const tripEntries: MetadataRoute.Sitemap = trips.map((t) => ({
    url: `${SITE_URL}${tripPath(t)}`,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const guideEntries: MetadataRoute.Sitemap = guides.map((g) => ({
    url: `${SITE_URL}/ratgeber/${g.slug}`,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticEntries, ...tripEntries, ...guideEntries];
}
