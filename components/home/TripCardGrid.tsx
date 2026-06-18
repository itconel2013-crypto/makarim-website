'use client';

import Link from 'next/link';
import { Trip } from '@/lib/content-schema';

interface TripCardGridProps {
  trips: Trip[];
  title?: string;
  description?: string;
}

export function TripCardGrid({
  trips,
  title = 'Empfohlene Reisen',
  description = 'Unsere beliebtesten und exklusivsten Angebote',
}: TripCardGridProps) {
  return (
    <section id="featured" className="py-section bg-page">
      <div className="container-max">
        <h2 className="text-h2-section font-serif font-500 text-ink mb-4 text-center">
          {title}
        </h2>
        <p className="text-body text-body-dark text-center mb-16 max-w-lg mx-auto">
          {description}
        </p>

        {trips.length === 0 ? (
          <div className="text-center py-12 bg-card-soft rounded-card">
            <p className="text-body text-body-light">
              Bald verfügbar
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trips.map((trip) => (
              <Link
                key={trip.vg}
                href={`/${trip.category}/${trip.slug}`}
                className="group block overflow-hidden rounded-card bg-white hover:shadow-card-lg transition-shadow"
              >
                {/* Trip Image */}
                <div className="relative bg-body-light w-full aspect-video overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-teal/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="text-5xl">{trip.heroIcon || '🕋'}</span>
                  </div>
                </div>

                {/* Trip Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-kicker font-mono text-primary font-500">
                      {(trip.category ?? 'Umrah').toString().toUpperCase()}
                    </span>
                    {trip.badge && (
                      <span className="bg-medina/20 text-medina-dark text-xs font-500 px-3 py-1 rounded-pill">
                        {trip.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-h3 font-serif font-500 text-ink mb-2 group-hover:text-primary transition-colors">
                    {trip.name}
                  </h3>

                  <p className="text-body text-body-dark mb-4 line-clamp-2">
                    {trip.description}
                  </p>

                  {/* Price & Duration */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div>
                      <p className="text-xs text-body-light uppercase font-mono">
                        Ab
                      </p>
                      <p className="text-h3 font-serif font-500 text-primary">
                        €{trip.price?.toLocaleString('de-DE') || 'POA'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-body-light uppercase font-mono">
                        Dauer
                      </p>
                      <p className="text-body font-500 text-ink">
                        {trip.nights} Nächte
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
