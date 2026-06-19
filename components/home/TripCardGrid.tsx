import { Trip } from '@/lib/content-schema';
import { TripCard } from '@/components/website/TripCard';

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
        <h2 className="text-h2-section font-serif font-normal text-ink mb-4 text-center">
          {title}
        </h2>
        <p className="text-body text-body-dark text-center mb-16 max-w-lg mx-auto">
          {description}
        </p>

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
