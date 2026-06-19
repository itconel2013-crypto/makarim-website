'use client';

import { useCMS } from '../CMSProvider';

export function ReisenPreview() {
  const { store } = useCMS();
  if (!store) return null;

  const trips = store.c.trips.filter((t) => t.published !== false);

  return (
    <div style={{ padding: '22px 20px', backgroundColor: '#F4F1EA' }}>
      <div style={{ fontFamily: "'Newsreader', serif", fontSize: '22px', color: '#16242B', marginBottom: '16px' }}>
        Aktuelle Umrah Reisen
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {trips.map((trip) => {
          const seats = trip.seats ?? 0;
          const pillBg = seats === 0 && !trip.waitlist ? '#F3E8E8'
            : seats <= 18 ? '#FEF3C7'
            : '#EAF0E8';
          const pillFg = seats === 0 && !trip.waitlist ? '#9B2020'
            : seats <= 18 ? '#92400E'
            : '#3E6B52';
          const status = seats === 0 && !trip.waitlist ? 'Ausgebucht'
            : seats === 0 && trip.waitlist ? 'Warteliste'
            : seats <= 18 ? `Noch ${seats} Plätze`
            : 'Verfügbar';

          return (
            <div key={trip.vg} style={{ background: '#fff', border: '1px solid #EAE3D8', borderRadius: '14px', overflow: 'hidden' }}>
              {/* Image */}
              <div style={{ position: 'relative', height: '120px', background: '#F4F1EA', overflow: 'hidden' }}>
                {trip.url ? (
                  <img src={trip.url} alt={trip.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#2D4A3E,#16242B)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '32px', opacity: 0.25 }}>🕋</span>
                  </div>
                )}

                {/* Banner */}
                {trip.banner?.enabled && (trip.banner.line1 || trip.banner.line2) && (
                  <div style={{ position: 'absolute', left: 0, top: '30px', background: trip.banner.color, color: '#fff', padding: '7px 14px 7px 12px' }}>
                    {trip.banner.line1 && <div style={{ fontFamily: "'Quicksand',sans-serif", fontWeight: 700, fontSize: '15px', lineHeight: 1, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{trip.banner.line1}</div>}
                    {trip.banner.line2 && <div style={{ fontFamily: "'Quicksand',sans-serif", fontWeight: 600, fontSize: '9px', lineHeight: 1, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.92, marginTop: '3px' }}>{trip.banner.line2}</div>}
                  </div>
                )}

                {/* Price badge */}
                <span style={{ position: 'absolute', top: '10px', right: '10px', background: '#F4F1EA', color: '#A8542F', fontWeight: 700, fontSize: '12px', borderRadius: '20px', padding: '5px 11px' }}>
                  ab {trip.price?.toLocaleString('de-DE')} €
                </span>
              </div>

              {/* Body */}
              <div style={{ padding: '13px 15px' }}>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ fontSize: '10.5px', fontWeight: 600, borderRadius: '5px', padding: '3px 8px', background: pillBg, color: pillFg }}>
                    {status}
                  </span>
                </div>
                <div style={{ fontFamily: "'Newsreader', serif", fontSize: '17px', color: '#16242B', lineHeight: 1.2, marginBottom: '5px' }}>
                  {trip.title}
                </div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#41494A', marginBottom: '7px' }}>
                  {trip.date}
                </div>
                <p style={{ fontSize: '12px', lineHeight: 1.5, color: '#6B6457', margin: 0 }}>
                  {trip.description || trip.text}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
