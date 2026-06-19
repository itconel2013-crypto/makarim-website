'use client';

import { useCMS } from '../CMSProvider';

export function ReisenPreview() {
  const { store } = useCMS();
  if (!store) return null;

  const trips = store.c.trips.filter((t) => t.published !== false).slice(0, 6);

  return (
    <div style={{ fontFamily: "'Schibsted Grotesk', sans-serif", backgroundColor: '#F4F1EA', padding: '24px 16px', minHeight: '100%' }}>
      <p style={{ fontFamily: 'monospace', fontSize: '10px', letterSpacing: '0.18em', color: '#A8542F', textTransform: 'uppercase', marginBottom: '6px' }}>
        Aktuelle Termine
      </p>
      <h2 style={{ fontFamily: "'Newsreader', serif", fontSize: '22px', fontWeight: 400, color: '#16242B', margin: '0 0 16px' }}>
        Unsere Reisen
      </h2>

      {/* Trip cards grid — 2 columns to fit preview width */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {trips.map((trip) => {
          const seats = trip.seats ?? 0;
          const status = seats === 0 && !trip.waitlist ? 'ausgebucht'
            : seats === 0 && trip.waitlist ? 'Warteliste'
            : seats <= 18 ? `noch ${seats} Plätze`
            : null;

          return (
            <div key={trip.vg} style={{ background: '#fff', border: '1px solid #EAE3D8', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {/* Image */}
              <div style={{ position: 'relative', height: '80px', background: '#F4F1EA', overflow: 'hidden', flexShrink: 0 }}>
                {trip.url ? (
                  <img src={trip.url} alt={trip.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#2D4A3E,#16242B)' }}>
                    <span style={{ fontSize: '20px', opacity: 0.3 }}>{trip.heroIcon ?? '🕋'}</span>
                  </div>
                )}

                {/* Banner */}
                {trip.banner?.enabled && (trip.banner.line1 || trip.banner.line2) && (
                  <div style={{ position: 'absolute', left: 0, top: '16px', background: trip.banner.color, color: '#fff', padding: '3px 7px 3px 6px' }}>
                    {trip.banner.line1 && <div style={{ fontFamily: "'Quicksand',sans-serif", fontWeight: 700, fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1 }}>{trip.banner.line1}</div>}
                    {trip.banner.line2 && <div style={{ fontFamily: "'Quicksand',sans-serif", fontWeight: 600, fontSize: '6px', textTransform: 'uppercase', opacity: 0.92, marginTop: '1px', letterSpacing: '0.04em', lineHeight: 1 }}>{trip.banner.line2}</div>}
                  </div>
                )}

                {/* Price badge */}
                <div style={{ position: 'absolute', top: '5px', right: '5px', background: '#F4F1EA', color: '#A8542F', fontWeight: 700, fontSize: '8px', borderRadius: '10px', padding: '3px 7px' }}>
                  ab {trip.price?.toLocaleString('de-DE')} €
                </div>
              </div>

              {/* Card body */}
              <div style={{ padding: '8px 10px 10px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                {status && (
                  <div style={{ marginBottom: '5px' }}>
                    <span style={{ fontSize: '8px', fontWeight: 600, borderRadius: '4px', padding: '2px 6px', background: '#FEF3C7', color: '#92400E' }}>
                      {status}
                    </span>
                  </div>
                )}
                <div style={{ fontFamily: "'Newsreader', serif", fontSize: '11px', color: '#16242B', lineHeight: 1.2, marginBottom: '4px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {trip.title}
                </div>
                <div style={{ fontSize: '8px', color: '#41494A', fontWeight: 600, marginBottom: '4px' }}>{trip.date}</div>
                <p style={{ fontSize: '8px', color: '#6B6457', lineHeight: 1.4, margin: '0 0 8px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', flex: 1 }}>
                  {trip.description || trip.text}
                </p>
                <div style={{ background: '#C2724A', color: '#fff', fontSize: '8px', fontWeight: 600, borderRadius: '6px', padding: '4px 0', textAlign: 'center' }}>
                  Jetzt entdecken
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
