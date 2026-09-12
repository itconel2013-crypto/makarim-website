import { NextRequest } from 'next/server';

/**
 * Einfache Zähl-Bremse im Arbeitsspeicher.
 *
 * BEWUSSTE GRENZE: Die Zähler leben im Prozess. Beim Neustart (Deploy) sind sie
 * weg, und bei mehreren Instanzen zählt jede für sich. Für unseren Fall reicht
 * das: Die App läuft als eine Instanz auf Railway, und der Zweck ist, massenhaft
 * automatisierte Anfragen abzubremsen — nicht, einen gezielten verteilten Angriff
 * abzuwehren. Wird das je nötig, gehört der Zähler in die Datenbank oder einen
 * geteilten Zwischenspeicher.
 */

interface Bucket {
  count: number;
  resetAt: number;   // Zeitpunkt (ms), ab dem neu gezählt wird
}

const buckets = new Map<string, Bucket>();

/** Abgelaufene Einträge wegräumen, damit die Map nicht unbegrenzt wächst. */
function prune(now: number): void {
  if (buckets.size < 500) return;
  for (const [key, b] of buckets) {
    if (b.resetAt <= now) buckets.delete(key);
  }
}

/**
 * Absender-Adresse bestimmen. Auf Railway steht die echte Adresse des Besuchers
 * im ersten Eintrag von `x-forwarded-for` — `request.ip` wäre die des Proxys.
 * Ohne erkennbare Adresse fallen alle auf denselben Schlüssel: dann bremst die
 * Sperre im Zweifel zu viel statt zu wenig.
 */
export function clientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip')?.trim() || 'unbekannt';
}

export interface RateLimitResult {
  ok: boolean;
  retryAfterSec: number;
}

/**
 * Zählt einen Zugriff auf `key`. Liefert ok=false, sobald `limit` innerhalb von
 * `windowMs` überschritten ist.
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  prune(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) };
  }
  return { ok: true, retryAfterSec: 0 };
}

/** Zähler für einen Schlüssel zurücksetzen — z. B. nach erfolgreichem Login. */
export function resetRateLimit(key: string): void {
  buckets.delete(key);
}

/**
 * Kürzt Freitext aus öffentlichen Formularen auf eine feste Höchstlänge.
 * Ohne solche Grenzen könnte eine einzige Anfrage ein Megabyte in die Datenbank
 * schreiben und als E-Mail ins Büro schicken.
 */
export function cap(value: unknown, maxLength: number): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}
