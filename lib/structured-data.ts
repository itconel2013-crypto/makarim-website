import type { CMSContent, Trip } from './content-schema';
import { SITE_URL } from './seo';

/**
 * Strukturierte Daten (schema.org) für die Kategorieseiten.
 *
 * Warum erzeugt statt eingetragen: Ein fester Codeblock müsste bei jeder Preis-
 * oder Terminänderung von Hand nachgezogen werden. Vergisst das jemand, behaupten
 * die strukturierten Daten etwas anderes als die sichtbare Seite — und das wertet
 * Google als Verstoß. Hier kommen beide aus derselben Quelle.
 *
 * Die Reise-Detailseiten haben ihre eigene Auszeichnung (TouristTrip, Offer,
 * TravelAgency) direkt in der Seite; diese Datei ist nur für die Übersichten.
 */

/** „07.10.2026 – 17.10.2026" → { start: "2026-10-07", end: "2026-10-17" } */
export function reiseDatenISO(trip: Pick<Trip, 'date'> & { dateStart?: string; dateEnd?: string }): {
  start?: string;
  end?: string;
} {
  // Wenn das CRM je echte Datumsfelder liefert, haben die Vorrang.
  if (trip.dateStart) return { start: trip.dateStart, end: trip.dateEnd };

  const treffer = (trip.date ?? '').match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/g);
  if (!treffer?.length) return {};

  const iso = (d: string) => {
    const [tag, monat, jahr] = d.split('.');
    return `${jahr}-${monat.padStart(2, '0')}-${tag.padStart(2, '0')}`;
  };
  return { start: iso(treffer[0]), end: treffer[1] ? iso(treffer[1]) : undefined };
}

/** Relativer Pfad → vollständige Adresse. Schema.org braucht absolute Adressen. */
function absolut(pfad?: string): string | undefined {
  if (!pfad) return undefined;
  if (/^https?:\/\//.test(pfad)) return pfad;
  return SITE_URL + (pfad.startsWith('/') ? pfad : `/${pfad}`);
}

/**
 * Anschrift aus dem CMS-Freitext lesen.
 * Gepflegt ist sie als „Anton-Hehn-Straße 5, 55246 Mainz - Kostheim, Deutschland".
 * Passt das Muster nicht, bleibt die Anschrift weg — lieber keine Angabe als eine
 * falsch zerlegte.
 */
function anschrift(zeile?: string) {
  if (!zeile) return undefined;
  const teile = zeile.split(',').map((t) => t.trim());
  if (teile.length < 2) return undefined;

  const plzOrt = teile[1].match(/^(\d{5})\s+(.+)$/);
  if (!plzOrt) return undefined;

  return {
    '@type': 'PostalAddress',
    streetAddress: teile[0],
    postalCode: plzOrt[1],
    addressLocality: plzOrt[2].replace(/\s*-\s*/g, '-'),
    addressCountry: 'DE',
  };
}

/** „@makarim_reisen" → vollständige Instagram-Adresse. */
function instagramUrl(handle?: string): string | undefined {
  if (!handle) return undefined;
  const name = handle.replace(/^@/, '').trim();
  return name ? `https://www.instagram.com/${name}/` : undefined;
}

export function veranstalter(content: CMSContent) {
  const b = content.brand;
  const sameAs = [instagramUrl(b.instagram)].filter(Boolean);

  return {
    '@type': 'TravelAgency',
    '@id': `${SITE_URL}/#veranstalter`,
    name: content.seo.siteName,
    url: SITE_URL,
    logo: absolut('/assets/makarim_soultreat.png'),
    ...(b.phone ? { telephone: b.phone } : {}),
    ...(b.email ? { email: b.email } : {}),
    ...(anschrift(b.address2) ? { address: anschrift(b.address2) } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

/**
 * Baut die Blöcke für eine Kategorieseite: Brotkrumenpfad, Liste der Reisen,
 * Veranstalter. Ausgegeben wird ein Array — schema.org erlaubt das, und es bleibt
 * bei einem einzigen script-Element in der Seite.
 */
export function kategorieStrukturdaten({
  content,
  kategorieTitel,
  kategoriePfad,
  trips,
}: {
  content: CMSContent;
  kategorieTitel: string;
  /** z. B. "/umrah-reisen" */
  kategoriePfad: string;
  trips: Trip[];
}) {
  const anbieter = veranstalter(content);

  const liste = trips.map((trip, i) => {
    const { start, end } = reiseDatenISO(trip);
    const url = `${SITE_URL}${kategoriePfad}/${trip.slug}`;
    const preis = typeof trip.price === 'number' && trip.price > 0 ? trip.price : undefined;

    return {
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'TouristTrip',
        name: trip.title,
        url,
        ...(trip.description ? { description: trip.description } : {}),
        ...(absolut(trip.url) ? { image: absolut(trip.url) } : {}),
        ...(start ? { startDate: start } : {}),
        ...(end ? { endDate: end } : {}),
        touristType: trip.typ,
        provider: { '@id': anbieter['@id'] },
        // Ohne Preis (z. B. Hajj über Nusuk) gar kein Angebot ausweisen —
        // „0 €" wäre schlechter als keine Angabe.
        ...(preis
          ? {
              offers: {
                '@type': 'Offer',
                price: preis,
                priceCurrency: 'EUR',
                url,
                availability:
                  (trip.seats ?? 0) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
              },
            }
          : {}),
      },
    };
  });

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Startseite', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: kategorieTitel, item: `${SITE_URL}${kategoriePfad}` },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: kategorieTitel,
      numberOfItems: liste.length,
      itemListElement: liste,
    },
    { '@context': 'https://schema.org', ...anbieter },
  ];
}
