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
  date: string;               // e.g., "15.–25. Juni 2026" — reiner ANZEIGETEXT, kein Datum
  // Optional und heute (noch) nicht vom CRM geliefert: maschinenlesbares Abreisedatum
  // (ISO, "2027-03-01"). Sobald das CRM es mitschickt, nutzt tripYear() es automatisch
  // statt das Jahr aus `date` zu lesen — ohne Änderung an den Seiten. Erst damit werden
  // startDate/endDate im JSON-LD, automatisches Sortieren und das Ausblenden abgelaufener
  // Reisen möglich. Beim Sync wäre es ein CRM-eigenes Feld (überschreibt).
  dateStart?: string;
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
  sectionOrder?: TripSectionKey[]; // CMS-only: Reihenfolge der Detailseiten-Blöcke (Inhalt/Leistungen/Hotels/Programm)
  // CMS-only: abweichende Zahlungs-/Stornobedingungen dieser Reise. Leer = es gilt,
  // was das CRM schickt (terms), sonst global (brand.bookingTerms). Muss den
  // CRM-Sync überleben → in mergeTrip bewahrt.
  bookingTerms?: BookingTermsConfig;
  // CRM-eigen: die wirksamen Zahlungs-/Stornobedingungen dieser Reise, mit jedem
  // Reise-Push aktualisiert. NICHT in mergeTrip bewahren — fehlt es im Push, ist
  // es im CRM nicht (mehr) gepflegt und muss auch hier verschwinden.
  terms?: CrmBookingTerms;
  /**
   * Wann sich an dieser Reise zuletzt etwas geändert hat (ISO-Zeit).
   * Gesetzt in mergeTrip, und zwar nur bei echten Änderungen — der Wert landet
   * als `lastmod` in der Sitemap und sagt Suchmaschinen, wo sich ein erneuter
   * Besuch lohnt. Fehlt er (Altbestand), bleibt der Eintrag ohne Datum.
   */
  lastModified?: string;
}

/** Sortierbare Blöcke der Reise-Detailseite (CMS-only). */
export const TRIP_SECTION_KEYS = ['content', 'services', 'hotels', 'program'] as const;
export type TripSectionKey = (typeof TRIP_SECTION_KEYS)[number];
export const TRIP_SECTION_LABELS: Record<TripSectionKey, string> = {
  content: 'Inhalt',
  services: 'Leistungen',
  hotels: 'Hotels',
  program: 'Programm',
};

/**
 * Liefert die effektive Reihenfolge der Detailseiten-Blöcke: gespeicherte, gültige
 * Keys zuerst (in ihrer Reihenfolge), fehlende Keys in Standardreihenfolge hinten
 * angehängt. So erscheint jeder Block immer, auch wenn `sectionOrder` unvollständig ist.
 */
export function orderedTripSections(order?: string[]): TripSectionKey[] {
  const valid = (order ?? []).filter(
    (k, i, arr): k is TripSectionKey =>
      (TRIP_SECTION_KEYS as readonly string[]).includes(k) && arr.indexOf(k) === i,
  );
  const seen = new Set<string>(valid);
  return [...valid, ...TRIP_SECTION_KEYS.filter((k) => !seen.has(k))];
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
  /**
   * Überschrift (H1) auf der Kategorieseite. Leer = es gilt `title`.
   *
   * Eigenes Feld, weil `title` zugleich die Kachel auf der Startseite beschriftet:
   * Dort passt „Umrah", als Seitenüberschrift verschenkt ein einzelnes Wort das
   * Suchwort. Hier steht z. B. „Umrah-Reisen 2026 & 2027".
   */
  headline?: string;
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

/** Eine Stufe der Stornostaffel, z. B. „bis 60 Tage vor Abreise" → „20 %". */
export interface CancellationTier {
  when: string;
  fee: string;
}

/**
 * Zahlungs- und Stornobedingungen für die Buchungsseite.
 *
 * Diese Angaben müssen bei Pauschalreisen VOR der verbindlichen Buchung
 * vorliegen — deshalb stehen sie auf dem Formular und nicht nur in der AGB.
 *
 * Gepflegt wird global unter /admin/zahlungsbedingungen; je Reise kann einzeln
 * übersteuert werden (CMS-Feld, überlebt den CRM-Sync — siehe mergeTrip in
 * app/api/content/route.ts).
 *
 * BEWUSST OHNE VORGABEWERTE: Ein erfundener Stornosatz wäre schlimmer als gar
 * keiner. Ist nichts gepflegt, bleibt der Block auf der Website unsichtbar
 * (siehe hasBookingTerms).
 */
export interface BookingTermsConfig {
  depositPerPerson?: number;        // Anzahlung je Person in Euro
  depositDue?: string;              // z. B. „fällig nach unserer Buchungsbestätigung"
  balanceDue?: string;              // z. B. „spätestens 30 Tage vor Abreise"
  cancellation?: CancellationTier[];
  cancellationText?: string;        // Freitext STATT der Staffel (CRM: stornoMode „Abweichend")
  note?: string;                    // optionaler Zusatz unter der Staffel
}

/**
 * Dieselben Bedingungen, wie das CRM sie mit dem Reise-Push schickt
 * (Datenvertrag: CRM-Auftrag-Zahlungsbedingungen.md).
 *
 * Das CRM ist die Quelle der Wahrheit: Es löst Standard/Abweichend bereits auf
 * und sendet nur die für diese Reise WIRKSAMEN Werte. Nicht Gepflegtes fehlt
 * ganz — es kommt weder 0 noch "" noch null an.
 *
 * Unterschied zur CMS-Fassung oben: Fristen sind Tageszahlen statt Sätze, und
 * die Stornostaffel kommt entweder als Stufenliste ODER als Freitext, nie als
 * beides. Die Sätze daraus baut crmTermsToConfig — so bleibt die Sprache der
 * Website an einer Stelle.
 */
export interface CrmCancellationTier {
  deadline: string;   // Frist, z. B. „bis 60 Tage vor Abreise"
  feePct: number;     // Gebühr in Prozent
}

export interface CrmBookingTerms {
  depositPerPerson?: number;   // Anzahlung je Person in Euro
  depositDays?: number;        // Tage NACH der Buchungsbestätigung
  finalDays?: number;          // Tage VOR Abreise
  cancellation?: CrmCancellationTier[];
  cancellationText?: string;   // alternativ zur Staffel
}

/** „7" → „fällig innerhalb von 7 Tagen nach unserer Buchungsbestätigung". */
function depositDueText(days?: number): string | undefined {
  if (typeof days !== 'number' || !Number.isFinite(days) || days < 0) return undefined;
  if (days === 0) return 'sofort nach unserer Buchungsbestätigung fällig';
  if (days === 1) return 'fällig innerhalb eines Tages nach unserer Buchungsbestätigung';
  return `fällig innerhalb von ${days} Tagen nach unserer Buchungsbestätigung`;
}

/** „30" → „spätestens 30 Tage vor Abreise". */
function balanceDueText(days?: number): string | undefined {
  if (typeof days !== 'number' || !Number.isFinite(days) || days < 0) return undefined;
  if (days === 0) return 'spätestens am Tag der Abreise';
  if (days === 1) return 'spätestens einen Tag vor Abreise';
  return `spätestens ${days} Tage vor Abreise`;
}

/**
 * CRM-Fassung in die Darstellungsfassung übersetzen. Erzeugt nur Text für das,
 * was tatsächlich ankommt — eine fehlende Frist bleibt eine fehlende Frist.
 */
export function crmTermsToConfig(crm?: CrmBookingTerms): BookingTermsConfig {
  if (!crm) return {};
  const tiers = crm.cancellation
    ?.filter((c) => c?.deadline?.trim() && typeof c.feePct === 'number')
    .map((c) => ({ when: c.deadline.trim(), fee: `${c.feePct} %` }));
  return {
    depositPerPerson:
      typeof crm.depositPerPerson === 'number' && crm.depositPerPerson > 0
        ? crm.depositPerPerson
        : undefined,
    depositDue: depositDueText(crm.depositDays),
    balanceDue: balanceDueText(crm.finalDays),
    // Staffel und Freitext schließen einander aus; die Staffel hat Vorrang,
    // falls wider Erwarten doch beides ankommt.
    cancellation: tiers?.length ? tiers : undefined,
    cancellationText: tiers?.length ? undefined : crm.cancellationText?.trim() || undefined,
  };
}

/**
 * Effektive Bedingungen einer Reise. Drei Ebenen, von stark nach schwach:
 *
 *   1. CMS je Reise   — bewusste Abweichung, die jemand im Admin eingetragen hat
 *   2. CRM            — die gepflegte Wahrheit des Veranstalters (Regelfall)
 *   3. CMS global     — Auffangwerte aus /admin/zahlungsbedingungen
 *
 * Feldweise, nicht blockweise: Eine Reise kann im CMS nur die Anzahlung
 * übersteuern und Fristen wie Staffel weiter aus dem CRM beziehen.
 *
 * Die Stornoangabe bildet eine Einheit — Staffel, Freitext und Fußnote kommen
 * immer aus derselben Ebene. Sonst stünde eine Fußnote unter einer Staffel, zu
 * der sie nie gehört hat.
 */
export function resolveBookingTerms(
  global?: BookingTermsConfig,
  trip?: BookingTermsConfig,
  crm?: CrmBookingTerms,
): BookingTermsConfig {
  const g = global ?? {};
  const c = crmTermsToConfig(crm);
  const t = trip ?? {};

  const hatStorno = (x: BookingTermsConfig) => !!x.cancellation?.length || !!x.cancellationText?.trim();
  const storno = [t, c, g].find(hatStorno) ?? {};

  const zahl = (x: BookingTermsConfig) =>
    typeof x.depositPerPerson === 'number' && x.depositPerPerson > 0 ? x.depositPerPerson : undefined;

  return {
    depositPerPerson: zahl(t) ?? zahl(c) ?? zahl(g),
    depositDue: t.depositDue?.trim() || c.depositDue || g.depositDue,
    balanceDue: t.balanceDue?.trim() || c.balanceDue || g.balanceDue,
    cancellation: storno.cancellation?.filter((x) => x.when?.trim() && x.fee?.trim()),
    cancellationText: storno.cancellationText?.trim() || undefined,
    // Die Fußnote ist CMS-eigen (das CRM hat dafür kein Feld) und gehört zur
    // Stornoangabe: Steht die aus dem CRM, passt eine globale Fußnote dazu.
    note: t.note?.trim() || g.note,
  };
}

/**
 * Ist überhaupt etwas Verwertbares gepflegt? Nur dann zeigt die Buchungsseite
 * den Block — lieber gar keine Angabe als eine ausgedachte.
 */
export function hasBookingTerms(terms?: BookingTermsConfig): boolean {
  if (!terms) return false;
  return (
    (typeof terms.depositPerPerson === 'number' && terms.depositPerPerson > 0) ||
    !!terms.depositDue?.trim() ||
    !!terms.balanceDue?.trim() ||
    !!terms.cancellation?.length ||
    !!terms.cancellationText?.trim()
  );
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
  step1Text: 'Wir senden dir in Kürze eine Bestätigungs-E-Mail mit dem verbindlichen Reisepreis.',
  step2Title: 'Anzahlung überweisen',
  step2Text: 'Überweise die Anzahlung erst nach unserer Bestätigungs-E-Mail und gib die dort genannte persönliche Vorgangsnummer als Verwendungszweck an.',
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
  /** Zahlungs- und Stornobedingungen (global; je Reise übersteuerbar). */
  bookingTerms?: BookingTermsConfig;
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
