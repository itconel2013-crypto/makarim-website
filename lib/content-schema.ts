// ============================================================================
// Content Schema — TypeScript types based on README specification
// ============================================================================

export interface Hotel {
  city: string;
  name: string;
  nights: string;
  rating: string; // e.g., "9,3" (comma decimal, 0-10 scale)
  dist: string;    // e.g., "ca. 150 m zum Haram" (pre-formatted)
  photo?: string;  // base64 or URL (CMS-only)
}

export interface Trip {
  vg: string;                 // Vorgangsnummer (id), e.g., "2026-0912"
  name: string;               // Display name (e.g., "Umrah Luxus")
  title: string;
  // Überschrift-Hoheit: false/fehlt = title folgt beim CRM-Sync automatisch dem CRM-Namen.
  // true = im CMS bewusst übersteuert — der Sync lässt title dann in Ruhe (Reset im Editor).
  titleOverride?: boolean;
  slug: string;               // URL-safe slug for routes
  category: 'umrah' | 'hajj' | 'kulturreisen';  // Category key for routing
  description: string;        // Short marketing text for cards
  typ: 'Umrah' | 'Hajj' | 'Kulturreisen';
  date: string;               // e.g., "15.–25. Juni 2026"
  nights: number;             // Number of nights
  price: number;              // per person, in EUR
  status: string;             // derived from seats/waitlist: "verfügbar", "begrenzte Plätze", "ausgebucht", "ausgebucht (Warteliste)"
  text: string;               // marketing text
  url?: string;               // Reisebild (Mediathek-URL) — NICHT der Slug!
  startseite: boolean;        // featured on home page
  published: boolean;         // draft/publish toggle (website shows only published !== false)
  seats: number;              // available seats
  waitlist: boolean;          // waitlist enabled?
  vorreservierung?: boolean;  // CRM: Reise noch nicht bestätigt → nur unverbindlich vorreservieren (keine Zahlung)
  badge?: string;             // optional badge text (e.g., "Bestseller", "Early Bird")
  heroIcon?: string;          // optional emoji or icon for card display
  leaderPhoto?: string;       // LEGACY (Einzelfoto) – wird beim Laden nach leaderPhotos migriert
  leaderPhotos?: string[];    // freigestellte Reiseleiter-Fotos (PNG, base64/URL) – CMS-only, unten rechts im Bild
  banner?: {
    enabled: boolean;
    line1: string;
    line2: string;
    color: string;            // hex color
  };
  seoTitle?: string;          // optional per-trip override
  seoDesc?: string;           // optional per-trip override
  hotels: Hotel[];
  services?: string[];        // included services list
  sections?: TripSection[];   // free heading+text blocks (H2) on the detail page
  program?: ProgramDay[];     // day-by-day itinerary
  prices?: TripPrices;        // explicit per-room prices from CRM (authoritative when present)
}

export interface ProgramDay {
  day: number | string;       // z.B. 1 oder "Tag 2–4"
  title: string;
  description: string;
}

/** A free content block on the trip detail page: heading (rendered as H2) + body text. */
export interface TripSection {
  heading: string;            // rendered as <h2> — good for SEO
  body: string;               // paragraph text below the heading
}

/** Per-person prices for one room category (whole EUR). child/baby null = not priced by CRM. */
export interface RoomPrice {
  adult: number;
  child: number | null;
  baby: number | null;
}

/**
 * Explicit room prices from the CRM (Option 1). Keys: quad=Vierbett, tpl=Dreibett,
 * dbl=Zweibett. A category is null when not offered for this trip (hide the row).
 * When `prices` is present it is authoritative — do NOT apply factors to set values.
 */
export interface TripPrices {
  quad?: RoomPrice | null;
  tpl?: RoomPrice | null;
  dbl?: RoomPrice | null;
}

export interface TrustCard {
  value: string;              // number/icon
  label: string;
}

export interface FeaturedSection {
  kicker: string;    // e.g. "Aktuelle Termine"
  title: string;     // e.g. "Unsere Umrah Reisen"
  linkText: string;  // e.g. "Alle Reisen ansehen →"
  linkUrl: string;   // e.g. "/umrah"
}

export interface HomeContent {
  kicker: string;
  headline: string;
  sub: string;
  btnP: string;               // primary button text
  btnS: string;               // secondary button text
  heroUrl?: string;           // base64 or URL
  stats?: TrustCard[];        // compact stats bar (40+, 10.000+ etc.)
  trust: TrustCard[];         // descriptive "Vier Gründe" cards
  featuredSection?: FeaturedSection;
}

export interface Category {
  key: 'umrah' | 'hajj' | 'kulturreisen';  // URL-safe key for routing
  name: string;               // Display name (e.g., "Umrah")
  title: string;
  description: string;        // Short description for category card
  text: string;               // Longer text
  icon?: string;              // Optional emoji/icon
  url: string;
  imageUrl?: string;          // base64 or URL for category card image
}

/**
 * FAQ-Listeneintrag. Ist `heading` gesetzt, ist der Eintrag eine thematische
 * Zwischenüberschrift (q/a bleiben leer); sonst eine Frage-Antwort-Zeile.
 * Alte Datenstände (nur q/a, kein heading) funktionieren unverändert weiter.
 */
export interface FAQ {
  q: string;
  a: string;
  heading?: string;
}

export interface AboutTile {
  t: string;                  // title
  b: string;                  // body
}

export interface AboutContent {
  title: string;
  body: string;
  url?: string;               // image 1
  url2?: string;              // image 2
  whyTitle: string;
  whyBody: string;
  tiles: AboutTile[];
}

export interface CTA {
  headline: string;
  sub: string;
  btnCall: string;
  btnWrite: string;
}

export interface BankDetails {
  inhaber: string;
  iban: string;
  bic: string;
  name: string;
}

export interface BookingEmailConfig {
  intro?: string;
  step1Title?: string;
  step1Text?: string;
  step2Title?: string;
  step2Text?: string;
  step3Title?: string;
  step3Text?: string;
}

/**
 * Texts on the on-page booking confirmation (the browser success page).
 * `intro` supports the placeholder {reise} (trip title); `step2Text` supports
 * {vg} (Vorgangsnummer). All fields are CMS-editable via /admin/buchung-bestaetigung.
 */
export interface BookingPageConfig {
  heading?: string;
  intro?: string;       // supports {reise}
  stepsTitle?: string;
  step1Title?: string;
  step1Text?: string;
  step2Title?: string;
  step2Text?: string;   // supports {vg}
  step3Title?: string;
  step3Text?: string;
}

/** Default copy for the booking confirmation page (booking — not inquiry — wording). */
export const defaultBookingPage: Required<BookingPageConfig> = {
  heading: 'Vielen Dank für deine Buchung',
  intro: 'Wir haben deine Buchung für {reise} erhalten. Die nächsten Schritte findest du unten.',
  stepsTitle: 'So schließt du deine Buchung ab',
  step1Title: 'Warte auf unsere Bestätigung',
  step1Text: 'Wir senden dir innerhalb von 24 Stunden eine Bestätigungs-E-Mail mit dem verbindlichen Reisepreis.',
  step2Title: 'Anzahlung überweisen',
  step2Text: 'Überweise die Anzahlung per Banküberweisung. Gib als Verwendungszweck die Vorgangsnummer {vg} an.',
  step3Title: 'Reiseunterlagen erhalten',
  step3Text: 'Nach Zahlungseingang erhältst du alle Reisedokumente per E-Mail.',
};

export interface Brand {
  phone: string;
  whatsapp: string;
  email: string;
  instagram: string;
  address1: string;
  address2: string;
  bank: BankDetails;
  footerCopyright?: string;
  footerTagline?: string;
  kontaktHeading?: string;
  kontaktIntro?: string;
  bookingEmail?: BookingEmailConfig;
  bookingPage?: BookingPageConfig;
}

export interface SEOConfig {
  siteName: string;
  defaultDesc: string;
  home?: { title: string; desc: string };
  umrah?: { title: string; desc: string };
  hajj?: { title: string; desc: string };
  kultur?: { title: string; desc: string };
  about?: { title: string; desc: string };
}

/**
 * Ratgeber-Artikel (Duas/Bittgebete, Packliste, Ablauf …).
 * Jeder Artikel ist eine eigene URL mit eigenen SEO-Metadaten — das ist der
 * SEO-Hebel: eine Seite je Suchbegriff statt einer Sammelseite.
 */
/** Herunterladbares Dokument (PDF) zu einem Ratgeber-Artikel. */
export interface GuideDoc {
  id: string;
  url: string;                // /api/uploads/<datei>.pdf
  title: string;              // Anzeigename, z. B. "Packliste Umrah"
}

export interface Guide {
  id: string;                 // stabile ID (intern)
  slug: string;               // URL-Pfad, z. B. "umrah-dua"
  title: string;              // H1
  excerpt: string;            // Teaser in der Übersicht + Meta-Fallback
  image?: string;             // optionales Titelbild (Mediathek)
  intro?: string;             // Einleitungsabsatz
  sections?: TripSection[];   // Überschrift + Text → als H2 gerendert (SEO)
  documents?: GuideDoc[];     // PDFs zum Download (Mehrwert; Fließtext bleibt der SEO-Träger)
  seoTitle?: string;
  seoDesc?: string;
  published: boolean;
}

/**
 * Galerie-Eintrag: entweder ein Bilder-Album (ein oder mehrere Bilder → Slider)
 * oder ein YouTube-Video.
 */
export interface GalleryItem {
  id: string;
  type: 'image' | 'video';
  url: string;                // Video: YouTube-Link. LEGACY: früher das Einzelbild.
  images?: string[];          // Bilder-Album — mehrere Bilder werden als Slider gezeigt
  title?: string;
  caption?: string;
  published: boolean;
}

/** Rechtstexte — im CMS gepflegt, Inhalt liefert der Betreiber (nicht generieren!). */
export interface LegalContent {
  impressum?: string;
  agb?: string;               // Reisebedingungen
  datenschutz?: string;
}

export interface CMSContent {
  home: HomeContent;
  categories: Category[];
  trips: Trip[];
  faq: FAQ[];
  guides?: Guide[];           // Ratgeber (optional: alte Datenstände haben das Feld nicht)
  gallery?: GalleryItem[];    // Galerie (optional, s. o.)
  legal?: LegalContent;       // Impressum / AGB / Datenschutz (optional)
  about: AboutContent;
  cta: CTA;
  brand: Brand;
  seo: SEOConfig;
}

export interface MediaItem {
  id: string;
  url: string;
  name: string;
  uploadedAt: string;
  alt?: string;           // SEO: Bildbeschreibung für Suchmaschinen & Screenreader
  title?: string;         // SEO: optionaler Bildtitel (Tooltip)
}

export interface CMSStore {
  c: CMSContent;
  media: MediaItem[];
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Default "Enthaltene Leistungen" list. Used to pre-fill trips that have never
 * had services set (trip.services === undefined). An explicit empty array means
 * the editor cleared it on purpose and is respected (no section shown).
 */
export const DEFAULT_INCLUDED: string[] = [
  'Hin- und Rückflug ab Deutschland',
  'Alle Transfers vor Ort',
  'Hotels in Mekka & Medina',
  'Visum & komplette Bearbeitung',
  'Tägliches Frühstück',
  'Deutschsprachige Reiseleitung',
  'Begleitetes Ziyarat-Programm',
  '24/7 Betreuung vor Ort',
];

/** Below this many free seats the exact count is shown (urgency); above it only "Begrenzte Plätze". */
export const SEATS_SHOW_COUNT = 17;

export interface Availability {
  label: string;                        // text shown to the user
  tone: 'green' | 'amber' | 'red';      // pill colour
  bookable: boolean;                    // false only when sold out without waitlist
}

/**
 * Availability shown on the website / CMS, derived from seats + waitlist:
 * - 0 seats + waitlist  → "Warteliste" (buchbar, geht ans CRM)
 * - 0 seats, no waitlist→ "Ausgebucht" (NICHT buchbar)
 * - 1..17 seats         → exakte Anzahl ("Noch X Plätze frei")
 * - >17 seats           → "Begrenzte Plätze"
 */
export function getAvailability(trip: Trip): Availability {
  const seats = trip.seats ?? 0;
  if (seats <= 0) {
    return trip.waitlist
      ? { label: 'Warteliste', tone: 'amber', bookable: true }
      : { label: 'Ausgebucht', tone: 'red', bookable: false };
  }
  if (seats <= SEATS_SHOW_COUNT) {
    return { label: `Noch ${seats} ${seats === 1 ? 'Platz' : 'Plätze'} frei`, tone: 'amber', bookable: true };
  }
  return { label: 'Begrenzte Plätze', tone: 'green', bookable: true };
}

/** @deprecated use getAvailability — kept for compatibility. */
export function deriveStatus(trip: Trip): string {
  const seats = trip.seats ?? 0;
  if (seats <= 0) return trip.waitlist ? 'ausgebucht (Warteliste)' : 'ausgebucht';
  if (seats <= SEATS_SHOW_COUNT) return 'begrenzte Plätze';
  return 'verfügbar';
}

/**
 * Filter trips: only published ones (published !== false)
 */
export function getPublishedTrips(trips: Trip[]): Trip[] {
  return trips.filter((t) => t.published !== false);
}

/**
 * Get featured trips (startseite === true)
 */
export function getFeaturedTrips(trips: Trip[]): Trip[] {
  return getPublishedTrips(trips).filter((t) => t.startseite === true).slice(0, 3);
}

/**
 * Get trips by category type
 */
export function getTripsByType(trips: Trip[], typ: 'Umrah' | 'Hajj' | 'Kulturreisen'): Trip[] {
  return getPublishedTrips(trips).filter((t) => t.typ === typ);
}

/**
 * Get a single trip by VG (Vorgangsnummer)
 */
export function getTripByVG(trips: Trip[], vg: string): Trip | undefined {
  return trips.find((t) => t.vg === vg);
}
