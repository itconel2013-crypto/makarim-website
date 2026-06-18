import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { loadContent } from '@/lib/db';
import { deriveStatus, Trip } from '@/lib/content-schema';
import { truncateText } from '@/lib/utils';

// ─── helpers ────────────────────────────────────────────────────────────────

function statusPillStyle(status: string): { bg: string; color: string; dot: string } {
  if (status === 'verfügbar')
    return { bg: '#EAF0E8', color: '#3E6B52', dot: '#3E6B52' };
  if (status === 'begrenzte Plätze' || status === 'ausgebucht (Warteliste)')
    return { bg: '#F6ECD9', color: '#956214', dot: '#E0A23C' };
  return { bg: '#EAE3D8', color: '#6B6457', dot: '#9A9082' };
}

// Distance pill for hotel card
function DistancePill({ city, dist }: { city: string; dist: string }) {
  const isMekka = city.toLowerCase().includes('mekk') || city.toLowerCase().includes('mecca');

  if (isMekka) {
    return (
      <span
        className="inline-flex items-center gap-1.5 font-medium"
        style={{ fontSize: '12px', color: '#A8542F', backgroundColor: '#F2E8DF', borderRadius: '20px', padding: '3px 10px' }}
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
  const description = trip.seoDesc || truncateText(trip.text, 158);

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

  const status = deriveStatus(trip);
  const pill = statusPillStyle(status);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: trip.title,
    description: trip.seoDesc || truncateText(trip.text, 200),
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
        <div className="relative z-10 container-max pb-10" style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%' }}>
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
        <div className="flex gap-12 items-start">

          {/* ── Main content ──────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* Intro paragraph */}
            <p className="mb-14 leading-relaxed" style={{ fontSize: '16.5px', color: '#5A5448' }}>
              {trip.text}
            </p>

            {/* ── Enthaltene Leistungen ─────────────────────────────── */}
            {trip.services && trip.services.length > 0 && (
              <section className="mb-14">
                <h2
                  className="font-serif font-normal text-ink mb-8"
                  style={{ fontSize: '28px' }}
                >
                  Enthaltene Leistungen
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {trip.services.map((service, i) => (
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
                  style={{ fontSize: '28px' }}
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

                          {/* Rating badge — terracotta pill, ★ score / 10 */}
                          <span
                            className="inline-flex items-center gap-1 text-white font-medium"
                            style={{ fontSize: '12px', backgroundColor: '#C2724A', borderRadius: '20px', padding: '2px 10px' }}
                          >
                            ★ {hotel.rating}
                            <span style={{ color: 'rgba(255,255,255,0.65)', marginLeft: '2px' }}>/ 10</span>
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
                  style={{ fontSize: '28px' }}
                >
                  Dein Programm
                </h2>

                {/* Vertical timeline */}
                <div className="relative">
                  {/* Vertical line */}
                  <div
                    className="absolute top-0 bottom-0"
                    style={{ left: '19px', width: '2px', backgroundColor: '#EAE3D8' }}
                  />

                  <div className="space-y-0">
                    {trip.program.map((day, i) => (
                      <div key={i} className="relative flex gap-6 pb-8">
                        {/* Day circle */}
                        <div
                          className="relative z-10 flex-shrink-0 flex items-center justify-center rounded-full font-mono font-semibold text-white"
                          style={{
                            width: '40px',
                            height: '40px',
                            backgroundColor: '#C2724A',
                            fontSize: '12px',
                          }}
                        >
                          {day.day}
                        </div>

                        {/* Content */}
                        <div className="flex-1 pt-2">
                          <h4
                            className="font-serif font-normal text-ink mb-1"
                            style={{ fontSize: '17px' }}
                          >
                            {day.title}
                          </h4>
                          <p className="text-body-sm text-body leading-relaxed">
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
            style={{ width: '372px', position: 'sticky', top: '88px' }}
          >
            <div
              className="overflow-hidden rounded-card bg-white"
              style={{ border: '1px solid #EAE3D8', boxShadow: '0 14px 34px rgba(40,30,20,0.10)' }}
            >
              {/* Price block */}
              <div className="p-7 border-b border-border-light">
                <p className="font-mono uppercase text-body-light mb-1" style={{ fontSize: '11px', letterSpacing: '0.15em' }}>
                  Preis pro Person
                </p>
                <p className="font-serif text-ink mb-1" style={{ fontSize: '38px', lineHeight: '1.1' }}>
                  €{trip.price?.toLocaleString('de-DE')}
                </p>
                <p className="text-body-sm text-body">inkl. Hotel & Führung, zzgl. Flug</p>
              </div>

              {/* Date + duration */}
              <div className="px-7 py-5 border-b border-border-light">
                <div className="flex items-center justify-between text-body-sm">
                  <span className="text-body">Reisedaten</span>
                  <span className="font-semibold text-ink tabular-nums">{trip.date}</span>
                </div>
                <div className="flex items-center justify-between text-body-sm mt-2">
                  <span className="text-body">Dauer</span>
                  <span className="font-semibold text-ink">{trip.nights} Nächte</span>
                </div>
              </div>

              {/* Availability */}
              <div className="px-7 py-5 border-b border-border-light">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: pill.dot }}
                  />
                  <span className="text-body-sm font-medium" style={{ color: pill.color }}>
                    {status}
                  </span>
                </div>
                {trip.seats > 0 && (
                  <p className="text-body-sm text-body-light mt-1">
                    Noch {trip.seats} Plätze verfügbar
                  </p>
                )}
              </div>

              {/* CTA */}
              <div className="p-7">
                <Link
                  href={`/${category}/${slug}/booking`}
                  className="block w-full text-center text-white font-medium transition-colors mb-3"
                  style={{
                    backgroundColor: '#C2724A',
                    height: '54px',
                    lineHeight: '54px',
                    borderRadius: '13px',
                    fontSize: '16px',
                  }}
                >
                  Jetzt anfragen
                </Link>
                <p className="text-xs text-center text-body-light">
                  Unverbindliche Buchungsanfrage · Kostenlos
                </p>
              </div>
            </div>

            {/* Contact block */}
            <div
              className="mt-4 p-5 rounded-card text-center"
              style={{ backgroundColor: '#F4F1EA', border: '1px solid #EAE3D8' }}
            >
              <p className="text-body-sm text-body mb-2">Fragen? Wir beraten gerne persönlich.</p>
              <a
                href={`tel:${content.c.brand.phone}`}
                className="text-primary font-medium text-sm hover:text-primary-dark transition-colors"
              >
                {content.c.brand.phone}
              </a>
            </div>
          </aside>
        </div>

        {/* Mobile CTA — shown below content on small screens */}
        <div className="lg:hidden mt-8 p-6 rounded-card bg-white" style={{ border: '1px solid #EAE3D8' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-mono uppercase text-body-light mb-0.5" style={{ fontSize: '11px' }}>ab</p>
              <p className="font-serif text-primary" style={{ fontSize: '30px' }}>€{trip.price?.toLocaleString('de-DE')}</p>
            </div>
            <div className="text-right text-body-sm text-body">
              <p>{trip.date}</p>
              <p>{trip.nights} Nächte</p>
            </div>
          </div>
          <Link
            href={`/${category}/${slug}/booking`}
            className="block w-full text-center text-white font-medium"
            style={{ backgroundColor: '#C2724A', height: '54px', lineHeight: '54px', borderRadius: '13px', fontSize: '16px' }}
          >
            Jetzt anfragen
          </Link>
        </div>
      </div>
    </main>
    </>
  );
}
