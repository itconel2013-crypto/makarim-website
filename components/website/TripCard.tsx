import Link from 'next/link';
import Image from 'next/image';
import { Trip, deriveStatus } from '@/lib/content-schema';

function StatusPill({ trip }: { trip: Trip }) {
  const status = deriveStatus(trip);
  if (status === 'ausgebucht') return (
    <span className="inline-flex items-center text-xs font-semibold px-3 py-1 rounded-pill" style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}>
      ausgebucht
    </span>
  );
  if (status === 'ausgebucht (Warteliste)') return (
    <span className="inline-flex items-center text-xs font-semibold px-3 py-1 rounded-pill" style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
      Warteliste
    </span>
  );
  if (status === 'begrenzte Plätze') return (
    <span className="inline-flex items-center text-xs font-semibold px-3 py-1 rounded-pill" style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
      noch {trip.seats} Plätze
    </span>
  );
  return null;
}

interface TripCardProps {
  trip: Trip;
}

export function TripCard({ trip }: TripCardProps) {
  const href = `/${trip.category}/${trip.slug}`;

  return (
    <Link href={href} className="group flex flex-col overflow-hidden rounded-card bg-white shadow-card hover:shadow-card-lg transition-shadow duration-300">
      {/* Image */}
      <div className="relative flex-shrink-0 overflow-hidden" style={{ height: '200px' }}>
        {trip.url ? (
          <Image
            src={trip.url}
            alt={`${trip.title} – Reisebild`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2D4A3E 0%, #16242B 100%)' }}>
            <span className="text-6xl opacity-30">{trip.heroIcon ?? '🕋'}</span>
          </div>
        )}

        {/* Dark gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/30 to-transparent pointer-events-none" />

        {/* Banner overlay bottom-left */}
        {trip.banner?.enabled && (trip.banner.line1 || trip.banner.line2) && (
          <div
            className="absolute bottom-3 left-3 px-3 py-2 rounded-button text-white leading-tight"
            style={{ backgroundColor: trip.banner.color }}
          >
            {trip.banner.line1 && <div className="font-bold uppercase tracking-widest" style={{ fontSize: '14px' }}>{trip.banner.line1}</div>}
            {trip.banner.line2 && <div className="font-normal uppercase tracking-wider opacity-90" style={{ fontSize: '11px' }}>{trip.banner.line2}</div>}
          </div>
        )}

        {/* Price badge top-right */}
        <div
          className="absolute top-3 right-3 px-3 py-1 rounded-pill text-xs font-semibold text-ink bg-white"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
        >
          ab {trip.price?.toLocaleString('de-DE')} €
        </div>
      </div>

      {/* Card body */}
      <div className="flex flex-col flex-1 p-5">
        {/* Status */}
        <div className="mb-3">
          <StatusPill trip={trip} />
        </div>

        {/* Title */}
        <h3 className="font-serif font-normal mb-2 leading-snug transition-colors group-hover:opacity-80" style={{ fontSize: '20px', color: '#16242B' }}>
          {trip.title}
        </h3>

        {/* Date */}
        <p className="font-mono mb-3" style={{ fontSize: '13px', fontWeight: 600, color: '#5A5448' }}>
          {trip.date}
          {trip.nights > 0 && <span className="font-normal ml-2" style={{ color: '#9A9082' }}>· {trip.nights} Nächte</span>}
        </p>

        {/* Description */}
        <p className="text-sm line-clamp-2 flex-1 mb-5" style={{ lineHeight: '1.6', color: '#6B6457' }}>
          {trip.description || trip.text}
        </p>

        {/* CTA Button */}
        <button
          className="w-full py-3 rounded-button text-white text-sm font-medium transition-opacity group-hover:opacity-90"
          style={{ backgroundColor: '#C2724A' }}
        >
          Jetzt entdecken
        </button>
      </div>
    </Link>
  );
}
