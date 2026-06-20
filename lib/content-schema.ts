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
  slug: string;               // URL-safe slug for routes
  category: 'umrah' | 'hajj' | 'kulturreisen';  // Category key for routing
  description: string;        // Short marketing text for cards
  typ: 'Umrah' | 'Hajj' | 'Kulturreisen';
  date: string;               // e.g., "15.–25. Juni 2026"
  nights: number;             // Number of nights
  price: number;              // per person, in EUR
  status: string;             // derived from seats/waitlist: "verfügbar", "begrenzte Plätze", "ausgebucht", "ausgebucht (Warteliste)"
  text: string;               // marketing text
  url?: string;               // slug or ID
  startseite: boolean;        // featured on home page
  published: boolean;         // draft/publish toggle (website shows only published !== false)
  seats: number;              // available seats
  waitlist: boolean;          // waitlist enabled?
  badge?: string;             // optional badge text (e.g., "Bestseller", "Early Bird")
  heroIcon?: string;          // optional emoji or icon for card display
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
  program?: ProgramDay[];     // day-by-day itinerary
}

export interface ProgramDay {
  day: number | string;       // z.B. 1 oder "Tag 2–4"
  title: string;
  description: string;
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

export interface FAQ {
  q: string;
  a: string;
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

export interface Brand {
  phone: string;
  whatsapp: string;
  email: string;
  instagram: string;
  address1: string;
  address2: string;
  bank: BankDetails;
  footerCopyright?: string;
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

export interface CMSContent {
  home: HomeContent;
  categories: Category[];
  trips: Trip[];
  faq: FAQ[];
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
 * Derive trip availability status from seats and waitlist
 */
export function deriveStatus(trip: Trip): string {
  if (trip.seats === 0) {
    return trip.waitlist ? 'ausgebucht (Warteliste)' : 'ausgebucht';
  }
  if (trip.seats > 18) {
    return 'verfügbar';
  }
  return 'begrenzte Plätze';
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
