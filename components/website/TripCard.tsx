import Link from 'next/link';
import Image from 'next/image';
import { Trip, getAvailability } from '@/lib/content-schema';

const PILL_TONE = {
  green: { bg: '#EAF0E8', color: '#3E6B52' },
  amber: { bg: '#FEF3C7', color: '#92400E' },
  red:   { bg: '#FEE2E2', color: '#991B1B' },
} as const;

function StatusPill({ trip }: { trip: Trip }) {
  const a = getAvailability(trip);
  const c = PILL_TONE[a.tone];
  return (
    <span style={{ fontSize: '11px', fontWeight: 600, borderRadius: '6px', padding: '4px 10px', backgroundColor: c.bg, color: c.color }}>
      {a.label}
    </span>
  );
}

interface TripCardProps {
  trip: Trip;
}

export function TripCard({ trip }: TripCardProps) {
  const href = `/${trip.category}/${trip.slug}`;

  return (
    <Link
      href={href}
      style={{
        background: '#fff',
        border: '1px solid #EAE3D8',
        borderRadius: '18px',
        overflow: 'hidden',
        boxShadow: '0 6px 22px rgba(40,30,20,0.05)',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        textDecoration: 'none',
        color: 'inherit',
      }}
      className="group hover:shadow-card-lg transition-shadow duration-300"
    >
      {/* Image area */}
      <div style={{ position: 'relative', height: '188px', background: '#F4F1EA', overflow: 'hidden' }}>
        {trip.url ? (
          <Image
            src={trip.url}
            alt={`${trip.title} – Reisebild`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #2D4A3E 0%, #16242B 100%)' }}>
            <span style={{ fontSize: '64px', opacity: 0.3 }}>{trip.heroIcon ?? '🕋'}</span>
          </div>
        )}

        {/* Banner — left:0, top:42px, no border-radius, Quicksand font */}
        {trip.banner?.enabled && (trip.banner.line1 || trip.banner.line2) && (
          <div style={{
            position: 'absolute',
            left: 0,
            top: '42px',
            background: trip.banner.color ?? '#C2724A',
            color: '#fff',
            padding: '9px 18px 9px 16px',
          }}>
            {trip.banner.line1 && (
              <div style={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '22px', lineHeight: 1, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                {trip.banner.line1}
              </div>
            )}
            {trip.banner.line2 && (
              <div style={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 600, fontSize: '12px', lineHeight: 1, opacity: 0.92, marginTop: '4px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {trip.banner.line2}
              </div>
            )}
          </div>
        )}

        {/* Price badge — top-right, beige background */}
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: '#F4F1EA',
          color: '#A8542F',
          fontWeight: 700,
          fontSize: '13px',
          borderRadius: '20px',
          padding: '6px 14px',
          boxShadow: '0 3px 10px rgba(0,0,0,0.14)',
        }}>
          ab {trip.price?.toLocaleString('de-DE')} €
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: '20px 20px 22px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Status pill */}
        <div style={{ marginBottom: '12px' }}>
          <StatusPill trip={trip} />
        </div>

        {/* Title */}
        <h3 style={{ fontFamily: "'Newsreader', serif", fontWeight: 500, fontSize: '21px', color: '#16242B', lineHeight: 1.22, margin: '0 0 9px' }}>
          {trip.title}
        </h3>

        {/* Date */}
        <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#41494A', fontVariantNumeric: 'tabular-nums', marginBottom: '11px' }}>
          {trip.date}
          {trip.nights > 0 && <span style={{ color: '#9A9082', fontWeight: 400, marginLeft: '8px' }}>· {trip.nights} Nächte</span>}
        </div>

        {/* Description */}
        <p style={{ fontSize: '14px', lineHeight: 1.55, color: '#6B6457', margin: '0 0 20px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {trip.description || trip.text}
        </p>

        {/* CTA Button — NOT full-width, left-aligned */}
        <button
          style={{ marginTop: 'auto', alignSelf: 'flex-start', height: '44px', padding: '0 22px', background: '#C2724A', border: 'none', borderRadius: '11px', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
          className="group-hover:opacity-90 transition-opacity"
        >
          Jetzt entdecken
        </button>
      </div>
    </Link>
  );
}
