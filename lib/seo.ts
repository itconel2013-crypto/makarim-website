import type { Metadata } from 'next';

/**
 * Baut die Metadaten einer öffentlichen Seite: Titel, Beschreibung, Kanonische
 * Adresse und die Vorschau fürs Teilen (Open Graph + Twitter Cards).
 *
 * Warum das zentral liegt: Next.js leitet og:title und og:description NICHT
 * automatisch aus title/description ab. Ohne eigene Angaben zeigt ein geteilter
 * Link gar nichts — kein Bild, kein Titel, keine Beschreibung. Bei Makarim läuft
 * die Weiterempfehlung über WhatsApp-Gruppen; dort ist der nackte Link ein
 * Verlust, der nichts mit Suchmaschinen zu tun hat.
 *
 * Die absoluten Adressen entstehen über metadataBase aus app/layout.tsx, deshalb
 * reichen hier relative Pfade wie "/umrah-reisen" oder "/api/uploads/x.jpg".
 */
/**
 * Sieht der Wert nach einem Bild aus?
 *
 * Das Feld trip.url enthält das Titelbild — in Altbeständen steht dort aber
 * manchmal ein Seitenpfad. Als og:image eingetragen führt das zu einer Vorschau
 * ohne Bild, und zwar lautlos: Im HTML steht ein og:image, es verweist nur auf
 * nichts. Deshalb lieber prüfen und sonst auf das Ersatzbild ausweichen.
 */
export function istBildpfad(wert?: string): boolean {
  if (!wert) return false;
  return /^\/api\/uploads\//.test(wert) || /^\/assets\//.test(wert) || /\.(jpe?g|png|webp|avif|gif)$/i.test(wert);
}

export function pageMetadata({
  title,
  description,
  path,
  image,
  siteName,
  type = 'website',
}: {
  title: string;
  description?: string;
  /** Pfad ab der Wurzel, mit führendem Schrägstrich. Startseite: "/". */
  path: string;
  /** Vorschaubild, relativ. Fehlt es, greift das Bild aus dem Layout. */
  image?: string;
  siteName: string;
  /** "article" für Ratgeber-Beiträge, sonst "website". */
  type?: 'website' | 'article';
}): Metadata {
  const bild = istBildpfad(image) ? image : undefined;
  const bilder = bild ? [{ url: bild, alt: title }] : undefined;

  return {
    title,
    description,
    // Kanonische Adresse: sagt Suchmaschinen, welche Fassung einer Seite zählt.
    // Bisher fehlte sie überall.
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName,
      locale: 'de_DE',
      type,
      ...(bilder ? { images: bilder } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(bild ? { images: [bild] } : {}),
    },
  };
}
