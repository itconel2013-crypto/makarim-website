import Link from 'next/link';
import Image from 'next/image';
import { Trip, deriveStatus } from '@/lib/content-schema';

function StatusPill({ status }: { status: string }) {
  let dotColor = '';
  let pillClass = '';

  if (status === 'verfügbar') {
    dotColor = 'bg-success';
    pillClass = 'bg-success-bg text-success';
  } else if (status === 'begrenzte Plätze') {
    dotColor = 'bg-status-dot';
    pillClass = 'bg-status-bg text-status';
  } else if (status === 'ausgebucht (Warteliste)') {
    dotColor = 'bg-status-dot';
    pillClass = 'bg-status-bg text-status';
  } else {
    dotColor = 'bg-body';
    pillClass = 'bg-border-light text-body-dark';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-pill ${pillClass}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColor}`} />
      {status}
    </span>
  );
}

interface TripCardProps {
  trip: Trip;
}

export function TripCard({ trip }: TripCardProps) {
  const status = deriveStatus(trip);
  const href = `/${trip.category}/${trip.slug}`;

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-card bg-white shadow-card hover:shadow-card-lg transition-shadow duration-300"
    >
      {/* Image — fixed 188px height */}
      <div className="relative flex-shrink-0 overflow-hidden" style={{ height: '188px' }}>
        {trip.url ? (
          <Image
            src={trip.url}
            alt={`${trip.title} – Reisebild`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/25 to-ink/35 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
            <span className="text-6xl opacity-50">{trip.heroIcon ?? '🕋'}</span>
          </div>
        )}

        {/* Subtle dark gradient over image */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/25 to-transparent pointer-events-none" />

        {/* Banner overlay — bottom-left, shown only when enabled */}
        {trip.banner?.enabled && (trip.banner.line1 || trip.banner.line2) && (
          <div
            className="absolute bottom-3 left-3 px-3 py-2 rounded-button font-display font-bold text-white text-sm leading-tight"
            style={{ backgroundColor: trip.banner.color }}
          >
            {trip.banner.line1 && <div>{trip.banner.line1}</div>}
            {trip.banner.line2 && <div className="text-xs opacity-90">{trip.banner.line2}</div>}
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="flex flex-col flex-1 p-6">
        {/* Status pill */}
        <div className="mb-3">
          <StatusPill status={status} />
        </div>

        {/* Title — Newsreader 21px */}
        <h3
          className="font-serif font-normal text-ink mb-2 group-hover:text-primary transition-colors leading-snug"
          style={{ fontSize: '21px' }}
        >
          {trip.title}
        </h3>

        {/* Date row — tabular-nums, 13.5px, weight 600 */}
        <p
          className="font-mono font-semibold text-body-dark mb-3 tabular-nums"
          style={{ fontSize: '13.5px' }}
        >
          {trip.date}
          {trip.nights > 0 && (
            <span className="text-body-light font-normal ml-2">· {trip.nights} Nächte</span>
          )}
        </p>

        {/* Marketing text — 14px, 2 lines */}
        <p className="text-body-sm text-body line-clamp-2 flex-1 mb-4">
          {trip.text}
        </p>

        {/* Price row */}
        <div className="pt-4 border-t border-border-light flex items-end justify-between">
          <div>
            <p className="text-kicker-sm font-mono text-body-light uppercase mb-0.5 tracking-widest">
              ab
            </p>
            <p className="font-serif text-primary" style={{ fontSize: '22px' }}>
              €{trip.price?.toLocaleString('de-DE')}
            </p>
          </div>
          <span className="text-sm text-primary font-medium group-hover:translate-x-1 transition-transform inline-block">
            Mehr →
          </span>
        </div>
      </div>
    </Link>
  );
}
