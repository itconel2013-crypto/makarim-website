/**
 * Utility functions for API and components
 */

/**
 * Das CRM liefert für Reisen ohne öffentlichen Preis (z. B. Hajj → Buchung über
 * Nusuk) `price: 0`. Solche Reisen dürfen NICHT als „0 €" erscheinen.
 */
export function hasPrice(price?: number | null): boolean {
  return typeof price === 'number' && price > 0;
}

export const PRICE_ON_REQUEST = 'Preis wird in Kürze veröffentlicht';

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
  }).format(price);
}

export function formatDate(date: string): string {
  // Already pre-formatted in data, e.g., "15.–25. Juni 2026"
  return date;
}

/**
 * Jahrgang einer Reise — Grundlage der Gruppierung auf den Rubrikseiten
 * („2026" … „2027" als Zwischenüberschrift).
 *
 * Bewusst ZWEISTUFIG, damit ein späteres CRM-Datumsfeld ohne Änderung an den
 * Seiten greift:
 *   1. `dateStart` (ISO, z. B. "2027-03-01") — sobald das CRM es liefert.
 *   2. Sonst das erste vierstellige Jahr aus dem Anzeigetext `date`
 *      ("15.–25. Mai 2026" → 2026). Heute greift immer dieser Zweig, weil
 *      `Trip.date` reiner Anzeigetext ohne maschinenlesbares Datum ist.
 *
 * Reise über den Jahreswechsel ("28. Dez. 2026 – 5. Jan. 2027"): es gewinnt das
 * ERSTE Jahr. Kunden planen nach dem Abflug, nicht nach der Rückkehr.
 *
 * Kein erkennbares Jahr → null. Solche Reisen verschwinden nicht, sie landen
 * ohne Überschrift am Ende der Liste (siehe groupTripsByYear).
 */
export function tripYear(trip: { dateStart?: string; date?: string }): number | null {
  const iso = trip.dateStart?.match(/^(\d{4})-\d{2}-\d{2}/);
  if (iso) return Number(iso[1]);
  const fromText = trip.date?.match(/\b(20\d{2})\b/);
  return fromText ? Number(fromText[1]) : null;
}

export interface TripYearGroup<T> {
  year: number | null;   // null = Jahr nicht erkennbar → Auffanggruppe ohne Überschrift
  trips: T[];
}

/**
 * Gruppiert Reisen nach Jahrgang, Gruppen aufsteigend (2026 vor 2027).
 *
 * Innerhalb einer Gruppe bleibt die im CMS gepflegte Reihenfolge unangetastet —
 * es wird NICHT nach Datum sortiert. Die Reihenfolge gehört dem Büro (Pfeiltasten
 * in /admin/reisen, siehe moveTripInList); die Gruppierung schiebt nur die
 * Jahrgänge auseinander.
 */
export function groupTripsByYear<T extends { dateStart?: string; date?: string }>(
  trips: T[],
): TripYearGroup<T>[] {
  const byYear = new Map<number, T[]>();
  const unknown: T[] = [];

  for (const trip of trips) {
    const year = tripYear(trip);
    if (year === null) { unknown.push(trip); continue; }
    const bucket = byYear.get(year);
    if (bucket) bucket.push(trip);
    else byYear.set(year, [trip]);
  }

  const groups: TripYearGroup<T>[] = [...byYear.keys()]
    .sort((a, b) => a - b)
    .map((year) => ({ year, trips: byYear.get(year)! }));

  if (unknown.length > 0) groups.push({ year: null, trips: unknown });
  return groups;
}

/** Kanonische Basis-URL der Live-Seite (für Sitemap, robots, Metadaten). */
export const SITE_URL = 'https://www.makarim.de';

/**
 * Rubrik-URLs.
 *
 * WICHTIG: Der interne Schlüssel (`umrah`) ist Teil des CRM-Vertrags und darf sich
 * NICHT ändern — das CRM schickt `category: "umrah"`. Öffentlich sichtbar ist nur
 * das URL-Segment (`umrah-reisen`). Beides ist hier bewusst entkoppelt.
 */
export const CATEGORY_SLUG = {
  umrah: 'umrah-reisen',
  hajj: 'hajj-reisen',
  kulturreisen: 'kulturreisen',
} as const;

export type CategoryKey = keyof typeof CATEGORY_SLUG;

/** Öffentliches URL-Segment → interner Schlüssel. null, wenn unbekannt (→ 404). */
export function categoryFromSlug(slug: string): CategoryKey | null {
  const keys = Object.keys(CATEGORY_SLUG) as CategoryKey[];
  return keys.find((k) => CATEGORY_SLUG[k] === slug) ?? null;
}

/** Pfad der Rubrikseite, z. B. "/umrah-reisen". */
export function categoryPath(key: string): string {
  return `/${CATEGORY_SLUG[key as CategoryKey] ?? key}`;
}

/** Pfad einer Reise, z. B. "/umrah-reisen/winter-umrah". */
export function tripPath(trip: { category: string; slug: string }): string {
  return `${categoryPath(trip.category)}/${trip.slug}`;
}

/**
 * Bilder eines Galerie-Eintrags. Früher hielt ein Eintrag genau ein Bild in `url`;
 * heute ist es die Liste `images`. Alte Einträge werden hier transparent
 * mitgelesen — keine Datenmigration nötig.
 */
export function galleryImages(item: { images?: string[]; url?: string; type?: string }): string[] {
  if (item.images?.length) return item.images;
  return item.type !== 'video' && item.url ? [item.url] : [];
}

/**
 * Zieht die Video-ID aus gängigen YouTube-Links (watch, youtu.be, shorts, embed).
 * Gibt null zurück, wenn der Link nicht erkannt wird.
 */
export function youtubeId(url: string): string | null {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|v\/))([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Verschiebt eine Reise um eine Position innerhalb der aktuell angezeigten Liste
 * (`displayed`, ggf. nach Rubrik gefiltert) und gibt ein neues, vollständiges
 * `allTrips`-Array mit vertauschten Positionen zurück. Getauscht werden die
 * beiden Elemente an ihrer Position in der Gesamtliste, damit die Reihenfolge
 * auch in der gefilterten Ansicht stimmt. Ist der Zug nicht möglich (Rand),
 * wird `allTrips` unverändert zurückgegeben.
 */
export function moveTripInList<T extends { vg: string }>(
  allTrips: T[],
  displayed: T[],
  vg: string,
  dir: 'up' | 'down',
): T[] {
  const di = displayed.findIndex((t) => t.vg === vg);
  const tj = dir === 'up' ? di - 1 : di + 1;
  if (di < 0 || tj < 0 || tj >= displayed.length) return allTrips;
  const gi = allTrips.findIndex((t) => t.vg === displayed[di].vg);
  const gj = allTrips.findIndex((t) => t.vg === displayed[tj].vg);
  if (gi < 0 || gj < 0) return allTrips;
  const next = allTrips.slice();
  [next[gi], next[gj]] = [next[gj], next[gi]];
  return next;
}

/**
 * Entfernt die Fett-Markierungen (*…* / **…**) für Kontexte, die reinen Text
 * brauchen: SEO-Meta-Beschreibung, JSON-LD, Kartentexte. Das Wort bleibt, nur
 * die Sternchen fallen weg. Siehe RichText (Anzeige der Fett-Schrift).
 */
export function stripInlineMarks(text: string | undefined | null): string {
  if (!text) return '';
  return text.replace(/\*\*([^*\n]+)\*\*/g, '$1').replace(/\*([^*\n]+)\*/g, '$1');
}

export function truncateText(text: string | undefined | null, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '…';
}

export function generateAlt(context: string, field?: string): string {
  const parts = [context];
  if (field) parts.push(field);
  return parts.join(' – ');
}

/**
 * Extract text for SEO description from marketing text
 * Clipped to ~158 chars (ideal meta description length)
 */
export function extractSEODescription(text: string, maxLength: number = 158): string {
  return truncateText(text, maxLength);
}
