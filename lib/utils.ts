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
