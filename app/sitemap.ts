import type { MetadataRoute } from 'next';
import { loadContent, contentUpdatedAt } from '@/lib/db';
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
    '/impressum',
    '/agb',
    '/datenschutz',
  ];

  // lastmod sagt Suchmaschinen, wo sich ein erneuter Besuch lohnt. Es muss
  // stimmen: Wer ständig „alles neu" meldet, dessen Angabe wird ignoriert.
  //
  // Deshalb nur dort, wo wir es wirklich wissen:
  //   Reisen           → eigener Stempel, gesetzt bei echten Änderungen
  //   Übersichtsseiten → Zeitpunkt der letzten CMS-Speicherung; diese Seiten
  //                      listen Reisen und ändern sich mit jeder Pflege mit
  //   Rechtstexte, FAQ, Kontakt → ohne Angabe. Sie ändern sich selten, und der
  //                      allgemeine CMS-Stempel wäre dort schlicht falsch.
  const cmsStand = contentUpdatedAt();
  const mitStand = new Set(['', categoryPath('umrah'), categoryPath('hajj'), categoryPath('kulturreisen'), '/ratgeber', '/galerie']);

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((p) => ({
    url: `${SITE_URL}${p}`,
    ...(cmsStand && mitStand.has(p) ? { lastModified: cmsStand } : {}),
    changeFrequency: 'weekly',
    priority: p === '' ? 1 : 0.8,
  }));

  const tripEntries: MetadataRoute.Sitemap = trips.map((t) => {
    const stand = t.lastModified ? new Date(t.lastModified) : undefined;
    return {
      url: `${SITE_URL}${tripPath(t)}`,
      ...(stand && !isNaN(stand.getTime()) ? { lastModified: stand } : {}),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    };
  });

  const guideEntries: MetadataRoute.Sitemap = guides.map((g) => ({
    url: `${SITE_URL}/ratgeber/${g.slug}`,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticEntries, ...tripEntries, ...guideEntries];
}
