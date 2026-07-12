import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { loadContent } from '@/lib/db';
import { getAvailability, Trip, DEFAULT_INCLUDED } from '@/lib/content-schema';
import { availableRooms, effectiveRoomPrice } from '@/lib/pricing';
import { truncateText, hasPrice, PRICE_ON_REQUEST, PRICE_ON_REQUEST_HINT } from '@/lib/utils';

// ─── helpers ────────────────────────────────────────────────────────────────

function statusPillStyle(tone: 'green' | 'amber' | 'red'): { bg: string; color: string; dot: string } {
  if (tone === 'green') return { bg: '#EAF0E8', color: '#3E6B52', dot: '#3E6B52' };
  if (tone === 'amber') return { bg: '#F6ECD9', color: '#956214', dot: '#E0A23C' };
  return { bg: '#FEE2E2', color: '#991B1B', dot: '#DC2626' };
}

// Distance pill for hotel card
function DistancePill({ city, dist }: { city: string; dist: string }) {
  // Erkennt alle gängigen Schreibweisen: Mekka, Makkah, Makka, Mecca (die
  // Stadt kommt aus dem CRM und kann anders transliteriert sein als "Mekka").
  const isMekka = /mekk|makk|mecc/.test(city.toLowerCase());

  if (isMekka) {
    return (
      <span
        className="inline-flex items-center gap-1.5 font-medium"
        style={{ fontSize: '12px', color: '#8A6A2C', backgroundColor: '#F5EDD6', borderRadius: '20px', padding: '3px 10px' }}
      >
        🕋 {dist}
      </span>
    );
  }

  // Medina — green dome pill
  return (
    <span
      className="inline-flex items-center gap-1.5 font-medium"
      style={{ fontSize: '12px', color: '#3E7256', backgroundColor: '#EAF1EC', borderRadius: '20px', padding: '3px 10px' }}
    >
      {/* CSS half-ellipse green dome */}
      <span
        style={{
          display: 'inline-block',
          width: '12px',
          height: '7px',
          backgroundColor: '#3E7256',
          borderRadius: '50% 50% 0 0',
          flexShrink: 0,
        }}
      />
      {dist}
    </span>
  );
}

// ─── metadata ───────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const content = await loadContent();
  const trip = content.c.trips.find((t) => t.slug === slug && t.published !== false);
  if (!trip) return {};

  const siteName = content.c.seo.siteName;
  const title = trip.seoTitle || `${trip.title} | ${siteName}`;
  const description = trip.seoDesc || truncateText(trip.text || trip.description, 158) || content.c.seo.defaultDesc;

  return { title, description };
}

// ─── page ────────────────────────────────────────────────────────────────────

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const content = await loadContent();

  const trip = content.c.trips.find(
    (t) => t.slug === slug && t.category === category && t.published !== false
  );
  if (!trip) notFound();

  const avail = getAvailability(trip);
  const pill = statusPillStyle(avail.tone);
  // Vorreservierung (CRM: Reise noch nicht bestätigt) hat Vorrang vor dem normalen
  // Buchungs-CTA — der Kunde soll nicht „Zur Buchung" lesen, wenn er nur reserviert.
  const ctaText = trip.vorreservierung
    ? 'Unverbindlich vorreservieren'
    : !avail.bookable ? 'Ausgebucht' : ((trip.seats ?? 0) <= 0 ? 'Auf die Warteliste' : 'Zur Buchung');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: trip.title,
    description: trip.seoDesc || truncateText(trip.text || trip.description, 200) || content.c.seo.defaultDesc,
    touristType: trip.typ,
    offers: {
      '@type': 'Offer',
      price: trip.price,
      priceCurrency: 'EUR',
      availability:
        trip.seats === 0
          ? 'https://schema.org/SoldOut'
          : 'https://schema.org/InStock',
    },
    provider: {
      '@type': 'TravelAgency',
      name: content.c.seo.siteName,
      telephone: content.c.brand.phone,
      email: content.c.brand.email,
    },
  };

  // Room prices for the detail-page table (only offered categories with a price).
  const priceRooms = availableRooms(trip)
    .map((r) => ({ label: r.label, p: effectiveRoomPrice(trip, r.value)! }))
    .filter((x) => x.p && x.p.adult > 0);

  // Sidebar room list + "ab" price (= cheapest adult room). Works for explicit
  // CRM prices AND legacy trips (min of the derived values).
  const PERSONS_PER_ROOM: Record<string, string> = {
    Vierbettzimmer: '4 Personen pro Zimmer',
    Dreibettzimmer: '3 Personen pro Zimmer',
    Doppelzimmer: '2 Personen pro Zimmer',
  };
  const roomList = priceRooms.map(({ label, p }) => ({ type: label, sub: PERSONS_PER_ROOM[label] ?? '', price: p.adult }));
  const abPrice = roomList.length ? Math.min(...roomList.map((r) => r.price)) : (trip.price ?? 0);
  const abRoomLabel = roomList.find((r) => r.price === abPrice)?.type ?? 'Vierbettzimmer';

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    <main className="min-h-screen bg-page">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ minHeight: '480px' }}>
        {/* Background */}
        {trip.url ? (
          <Image
            src={trip.url}
            alt={`${trip.title} – Titelbild`}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #16242B 0%, #2E4A56 100%)' }}
          >
            <span style={{ fontSize: '80px', opacity: 0.3 }}>{trip.heroIcon ?? '🕋'}</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, rgba(20,14,8,0.18) 0%, rgba(20,14,8,0.72) 100%)' }}
        />

        {/* Back link */}
        <div className="relative z-10 container-max pt-6">
          <Link
            href={`/${category}`}
            className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors"
          >
            ← Zurück
          </Link>
        </div>

        {/* Bottom-left: kicker + H1 */}
        <div className="absolute inset-x-0 bottom-0 z-10 container-max pb-10">
          <p
            className="font-mono uppercase mb-3 text-white"
            style={{ fontSize: '13px', letterSpacing: '0.2em', color: '#F0CDA8' }}
          >
            {trip.typ} · {trip.nights} Nächte
          </p>
          <h1
            className="font-serif font-normal text-white"
            style={{ fontSize: 'clamp(26px, 4vw, 44px)', lineHeight: '1.2', maxWidth: '760px' }}
          >
            {trip.title}
          </h1>
        </div>
      </section>

      {/* ── Body: 2-col layout (content + sticky sidebar) ────────────── */}
      <div className="container-max py-14">
        <div className="flex flex-col lg:flex-row gap-10 items-start">

          {/* ── Main content ──────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* Intro paragraph — only when filled, so the page can start
                directly with an H2 section if the Langtext is left empty. */}
            {trip.text?.trim() && (
              <p className="mb-14 leading-relaxed" style={{ fontSize: '16.5px', color: '#5A5448', whiteSpace: 'pre-line' }}>
                {trip.text}
              </p>
            )}

            {/* ── Freie Abschnitte (Überschrift + Text) ─────────────── */}
            {(trip.sections ?? [])
              .filter((s) => s.heading?.trim() || s.body?.trim())
              .map((s, i) => (
                <section key={i} className="mb-14">
                  {s.heading?.trim() && (
                    <h2
                      className="font-serif font-normal text-ink mb-4"
                      style={{ fontSize: 'clamp(22px, 3vw, 28px)' }}
                    >
                      {s.heading}
                    </h2>
                  )}
                  {s.body?.trim() && (
                    <p className="leading-relaxed" style={{ fontSize: '16.5px', color: '#5A5448', whiteSpace: 'pre-line' }}>
                      {s.body}
                    </p>
                  )}
                </section>
              ))}

            {/* ── Enthaltene Leistungen ─────────────────────────────── */}
            {/* Read from trip data; trips never customized fall back to the
                standard list (same one the CMS pre-fills with). */}
            {(trip.services === undefined ? DEFAULT_INCLUDED : trip.services).length > 0 && (
              <section className="mb-14">
                <h2
                  className="font-serif font-normal text-ink mb-8"
                  style={{ fontSize: 'clamp(22px, 3vw, 28px)' }}
                >
                  Enthaltene Leistungen
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(trip.services === undefined ? DEFAULT_INCLUDED : trip.services).map((service, i) => (
                    <div key={i} className="flex items-start gap-3">
                      {/* Green check circle — 24px, bg #EAF0E8, color #3E6B52 */}
                      <span
                        className="flex-shrink-0 flex items-center justify-center rounded-full"
                        style={{ width: '24px', height: '24px', backgroundColor: '#EAF0E8', color: '#3E6B52', marginTop: '1px' }}
                        aria-hidden="true"
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      <span style={{ fontSize: '14.5px', color: '#5A5448', lineHeight: '1.5' }}>{service}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ── Deine Hotels ──────────────────────────────────────── */}
            {trip.hotels && trip.hotels.length > 0 && (
              <section className="mb-14">
                <h2
                  className="font-serif font-normal text-ink mb-8"
                  style={{ fontSize: 'clamp(22px, 3vw, 28px)' }}
                >
                  Deine Hotels
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {trip.hotels.map((hotel, i) => (
                    <div
                      key={i}
                      className="overflow-hidden rounded-card bg-white"
                      style={{ border: '1px solid #EAE3D8', boxShadow: '0 6px 22px rgba(40,30,20,0.05)' }}
                    >
                      {/* Hotel photo — 158px tall */}
                      <div
                        className="relative overflow-hidden bg-page"
                        style={{ height: '158px' }}
                      >
                        {hotel.photo ? (
                          <Image
                            src={hotel.photo}
                            alt={`${hotel.name} – ${hotel.city}`}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #F0E4DC, #EAE3D8)' }}>
                            <span style={{ fontSize: '36px', opacity: 0.5 }}>🏨</span>
                          </div>
                        )}
                      </div>

                      {/* Hotel body */}
                      <div className="p-5">
                        {/* Top row: city + rating badge */}
                        <div className="flex items-center justify-between mb-2">
                          {/* City — mono 11px uppercase, #A8542F */}
                          <span
                            className="font-mono uppercase font-medium"
                            style={{ fontSize: '11px', color: '#A8542F', letterSpacing: '0.1em' }}
                          >
                            {hotel.city}
                          </span>

                          {/* Rating badge — only score highlighted, /10 outside */}
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#C2724A', color: '#fff', borderRadius: '7px', padding: '3px 8px', fontSize: '12.5px', fontWeight: 700, lineHeight: 1 }}>
                              <span style={{ fontSize: '10px' }}>★</span>{hotel.rating}
                            </span>
                            <span style={{ fontSize: '11.5px', color: '#9A9082' }}>/ 10</span>
                          </span>
                        </div>

                        {/* Hotel name — Newsreader 19px */}
                        <h3
                          className="font-serif font-normal text-ink mb-1"
                          style={{ fontSize: '19px', lineHeight: '1.3' }}
                        >
                          {hotel.name}
                        </h3>

                        {/* Nights */}
                        <p className="text-body-sm text-body mb-3">{hotel.nights}</p>

                        {/* Distance pill */}
                        <DistancePill city={hotel.city} dist={hotel.dist} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ── Dein Programm ─────────────────────────────────────── */}
            {trip.program && trip.program.length > 0 && (
              <section className="mb-14">
                <h2
                  className="font-serif font-normal text-ink mb-8"
                  style={{ fontSize: 'clamp(22px, 3vw, 28px)' }}
                >
                  Dein Programm
                </h2>

                <div>

                  <div>
                    {trip.program.map((day, i) => (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '18px 1fr', gap: '18px' }}>
                        {/* Dot + vertical line */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div style={{ width: '13px', height: '13px', borderRadius: '50%', backgroundColor: '#C2724A', marginTop: '4px', flexShrink: 0 }} />
                          {i < trip.program!.length - 1 && (
                            <div style={{ width: '2px', flex: 1, backgroundColor: '#E4DBCD', margin: '4px 0' }} />
                          )}
                        </div>

                        {/* Content */}
                        <div style={{ paddingBottom: '26px' }}>
                          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', letterSpacing: '0.12em', color: '#A8542F', textTransform: 'uppercase', marginBottom: '5px' }}>
                            {typeof day.day === 'number' ? `Tag ${day.day}` : day.day}
                          </div>
                          <div style={{ fontFamily: "'Newsreader', serif", fontSize: '20px', color: '#16242B', marginBottom: '6px' }}>
                            {day.title}
                          </div>
                          <p style={{ fontSize: '14.5px', lineHeight: '1.6', color: '#6B6457', margin: 0 }}>
                            {day.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* ── Sticky Sidebar — 372px ────────────────────────────────── */}
          <aside
            className="hidden lg:block flex-shrink-0"
            style={{ width: '372px', position: 'sticky', top: '96px' }}
          >
            <div style={{ background: '#fff', border: '1px solid #EAE3D8', borderRadius: '20px', padding: '26px', boxShadow: '0 10px 30px rgba(40,30,20,0.08)' }}>
              {/* Price — ohne Preis (z. B. Hajj → Nusuk) niemals „0 €" zeigen */}
              {hasPrice(abPrice) ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', color: '#9A9082' }}>ab</span>
                    <span style={{ fontFamily: "'Newsreader', serif", fontSize: '40px', color: '#16242B', lineHeight: 1 }}>
                      {abPrice.toLocaleString('de-DE')} €
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#9A9082', marginBottom: '16px' }}>pro Person im {abRoomLabel}</div>
                </>
              ) : (
                <>
                  <div style={{ fontFamily: "'Newsreader', serif", fontSize: '30px', color: '#16242B', lineHeight: 1.15, marginBottom: '4px' }}>
                    {PRICE_ON_REQUEST}
                  </div>
                  <div style={{ fontSize: '13px', color: '#9A9082', marginBottom: '16px' }}>{PRICE_ON_REQUEST_HINT}</div>
                </>
              )}

              {/* Status badge */}
              <div style={{ display: 'inline-flex', fontSize: '12.5px', fontWeight: 600, borderRadius: '20px', padding: '6px 14px', backgroundColor: pill.bg, color: pill.color, marginBottom: '20px' }}>
                {avail.label}
              </div>

              {/* Termin + Dauer */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '11px', padding: '16px 0', borderTop: '1px solid #F0EADF', borderBottom: '1px solid #F0EADF', marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ color: '#9A9082' }}>Termin</span>
                  <span style={{ color: '#16242B', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{trip.date}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ color: '#9A9082' }}>Dauer</span>
                  <span style={{ color: '#16242B', fontWeight: 600 }}>{trip.nights + 1} Tage · {trip.nights} Nächte</span>
                </div>
              </div>

              {/* Zimmerkategorien */}
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', color: '#9A9082', textTransform: 'uppercase', marginBottom: '12px' }}>Zimmerkategorien</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', marginBottom: '22px' }}>
                {roomList.map((r) => (
                  <div key={r.type} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', border: '1px solid #EFE8DC', borderRadius: '11px' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#16242B' }}>{r.type}</div>
                      <div style={{ fontSize: '11.5px', color: '#9A9082', marginTop: '2px' }}>{r.sub}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '11px', color: '#9A9082' }}>ab </span>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: '#16242B' }}>{r.price?.toLocaleString('de-DE')} €</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              {avail.bookable ? (
                <Link
                  href={`/${category}/${slug}/booking`}
                  className="block w-full text-center text-white hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#C2724A', height: '54px', lineHeight: '54px', borderRadius: '13px', fontSize: '16px', fontWeight: 600, boxShadow: '0 8px 20px rgba(194,114,74,0.32)' }}
                >
                  {ctaText}
                </Link>
              ) : (
                <div className="block w-full text-center" style={{ backgroundColor: '#EAE3D8', color: '#9A9082', height: '54px', lineHeight: '54px', borderRadius: '13px', fontSize: '16px', fontWeight: 600, cursor: 'not-allowed' }}>
                  {ctaText}
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* Mobile CTA — shown below content on small screens */}
        <div className="lg:hidden mt-8" style={{ background: '#fff', border: '1px solid #EAE3D8', borderRadius: '20px', padding: '24px', boxShadow: '0 10px 30px rgba(40,30,20,0.08)' }}>
          {/* Price — ohne Preis (z. B. Hajj → Nusuk) niemals „0 €" zeigen */}
          {hasPrice(abPrice) ? (
            <>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '13px', color: '#9A9082' }}>ab</span>
                <span style={{ fontFamily: "'Newsreader', serif", fontSize: '38px', color: '#16242B', lineHeight: 1 }}>
                  {abPrice.toLocaleString('de-DE')} €
                </span>
              </div>
              <div style={{ fontSize: '13px', color: '#9A9082', marginBottom: '14px' }}>pro Person im {abRoomLabel}</div>
            </>
          ) : (
            <>
              <div style={{ fontFamily: "'Newsreader', serif", fontSize: '28px', color: '#16242B', lineHeight: 1.15, marginBottom: '4px' }}>
                {PRICE_ON_REQUEST}
              </div>
              <div style={{ fontSize: '13px', color: '#9A9082', marginBottom: '14px' }}>{PRICE_ON_REQUEST_HINT}</div>
            </>
          )}

          {/* Status badge */}
          <div style={{ display: 'inline-flex', fontSize: '12.5px', fontWeight: 600, borderRadius: '20px', padding: '6px 14px', backgroundColor: pill.bg, color: pill.color, marginBottom: '18px' }}>
            {avail.label}
          </div>

          {/* Termin + Dauer */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '14px 0', borderTop: '1px solid #F0EADF', borderBottom: '1px solid #F0EADF', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: '#9A9082' }}>Termin</span>
              <span style={{ color: '#16242B', fontWeight: 600 }}>{trip.date}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: '#9A9082' }}>Dauer</span>
              <span style={{ color: '#16242B', fontWeight: 600 }}>{trip.nights + 1} Tage · {trip.nights} Nächte</span>
            </div>
          </div>

          {/* Zimmerkategorien */}
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', color: '#9A9082', textTransform: 'uppercase', marginBottom: '10px' }}>Zimmerkategorien</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
            {roomList.map((r) => (
              <div key={r.type} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', border: '1px solid #EFE8DC', borderRadius: '11px' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#16242B' }}>{r.type}</div>
                  <div style={{ fontSize: '11.5px', color: '#9A9082', marginTop: '2px' }}>{r.sub}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '11px', color: '#9A9082' }}>ab </span>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: '#16242B' }}>{r.price?.toLocaleString('de-DE')} €</span>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          {avail.bookable ? (
          <Link
            href={`/${category}/${slug}/booking`}
            className="block w-full text-center text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#C2724A', height: '54px', lineHeight: '54px', borderRadius: '13px', fontSize: '16px', fontWeight: 600, boxShadow: '0 8px 20px rgba(194,114,74,0.32)' }}
          >
            {ctaText}
          </Link>
          ) : (
            <div className="block w-full text-center" style={{ backgroundColor: '#EAE3D8', color: '#9A9082', height: '54px', lineHeight: '54px', borderRadius: '13px', fontSize: '16px', fontWeight: 600, cursor: 'not-allowed' }}>
              {ctaText}
            </div>
          )}
        </div>
      </div>
    </main>
    </>
  );
}
