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

      {/* Trip cards — single column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {trips.map((trip) => {
          const seats = trip.seats ?? 0;
          const status = seats === 0 && !trip.waitlist ? 'ausgebucht'
            : seats === 0 && trip.waitlist ? 'Warteliste'
            : seats <= 18 ? `noch ${seats} Plätze`
            : null;

          return (
            <div key={trip.vg} style={{ background: '#fff', border: '1px solid #EAE3D8', borderRadius: '12px', overflow: 'hidden', display: 'flex' }}>
              {/* Image */}
              <div style={{ position: 'relative', width: '120px', flexShrink: 0, background: '#F4F1EA', overflow: 'hidden' }}>
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
              <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  {status && (
                    <span style={{ fontSize: '10px', fontWeight: 600, borderRadius: '4px', padding: '2px 8px', background: '#FEF3C7', color: '#92400E' }}>
                      {status}
                    </span>
                  )}
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#A8542F', marginLeft: 'auto' }}>ab {trip.price?.toLocaleString('de-DE')} €</span>
                </div>
                <div style={{ fontFamily: "'Newsreader', serif", fontSize: '16px', color: '#16242B', lineHeight: 1.2, marginBottom: '5px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {trip.title}
                </div>
                <div style={{ fontSize: '11px', color: '#41494A', fontWeight: 600, marginBottom: '5px' }}>{trip.date}</div>
                <p style={{ fontSize: '11px', color: '#6B6457', lineHeight: 1.4, margin: '0 0 10px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', flex: 1 }}>
                  {trip.description || trip.text}
                </p>
                <div style={{ background: '#C2724A', color: '#fff', fontSize: '11px', fontWeight: 600, borderRadius: '7px', padding: '5px 0', textAlign: 'center' }}>
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
