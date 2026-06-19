import Link from 'next/link';
import { Trip, FeaturedSection } from '@/lib/content-schema';
import { TripCard } from '@/components/website/TripCard';

interface TripCardGridProps {
  trips: Trip[];
  featured?: FeaturedSection;
}

const DEFAULTS: FeaturedSection = {
  kicker: 'Aktuelle Reisen',
  title: 'Eine Auswahl unserer Reisen',
  linkText: 'Alle Reisen ansehen →',
  linkUrl: '/umrah',
};

export function TripCardGrid({ trips, featured }: TripCardGridProps) {
  const s = { ...DEFAULTS, ...featured };

  return (
    <section id="featured" className="bg-page" style={{ padding: '60px 0 20px' }}>
      <div className="container-max">
        {/* Header row: kicker+title left, link vertically centered right */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '34px' }}>
          <div>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', letterSpacing: '0.2em', color: '#A8542F', textTransform: 'uppercase', marginBottom: '10px' }}>
              {s.kicker}
            </p>
            <h2 style={{ fontFamily: "'Newsreader', serif", fontWeight: 500, fontSize: 'clamp(28px, 3vw, 42px)', color: '#16242B', margin: 0 }}>
              {s.title}
            </h2>
          </div>
          <Link
            href={s.linkUrl}
            style={{ fontSize: '14px', color: '#8A513A', fontWeight: 600, borderBottom: '1.5px solid #C2724A', paddingBottom: '2px', textDecoration: 'none', flexShrink: 0, marginLeft: '24px' }}
          >
            {s.linkText}
          </Link>
        </div>

        {trips.length === 0 ? (
          <div className="text-center py-12 rounded-card" style={{ backgroundColor: '#F4F1EA' }}>
            <p className="text-body-light text-sm">Bald verfügbar</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trips.map((trip) => (
              <TripCard key={trip.vg} trip={trip} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
