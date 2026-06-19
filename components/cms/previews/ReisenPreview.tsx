'use client';

import { useCMS } from '../CMSProvider';

export function ReisenPreview() {
  const { store } = useCMS();
  if (!store) return null;

  const trips = store.c.trips.filter((t) => t.published !== false).slice(0, 6);

  return (
    <div style={{ fontFamily: "'Schibsted Grotesk', sans-serif", backgroundColor: '#F4F1EA', padding: '32px 24px' }}>
      <p style={{ fontFamily: 'monospace', fontSize: '11px', letterSpacing: '0.18em', color: '#A8542F', textTransform: 'uppercase', marginBottom: '8px' }}>
        Aktuelle Termine
      </p>
      <h2 style={{ fontFamily: "'Newsreader', serif", fontSize: '28px', fontWeight: 400, color: '#16242B', margin: '0 0 20px' }}>
        Unsere Reisen
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {trips.map((trip) => (
          <div key={trip.vg} style={{ background: '#fff', border: '1px solid #EAE3D8', borderRadius: '14px', overflow: 'hidden', display: 'flex' }}>
            {/* Image */}
            <div style={{ width: '90px', flexShrink: 0, position: 'relative', background: '#F4F1EA', overflow: 'hidden' }}>
              {trip.url ? (
                <img src={trip.url} alt={trip.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', minHeight: '72px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#2D4A3E,#16242B)' }}>
                  <span style={{ fontSize: '24px', opacity: 0.3 }}>{trip.heroIcon ?? '🕋'}</span>
                </div>
              )}
              {/* Banner */}
              {trip.banner?.enabled && (trip.banner.line1 || trip.banner.line2) && (
                <div style={{ position: 'absolute', left: 0, top: '12px', background: trip.banner.color, color: '#fff', padding: '3px 7px' }}>
                  <div style={{ fontFamily: "'Quicksand',sans-serif", fontWeight: 700, fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{trip.banner.line1}</div>
                  {trip.banner.line2 && <div style={{ fontFamily: "'Quicksand',sans-serif", fontWeight: 600, fontSize: '6px', textTransform: 'uppercase', opacity: 0.92, marginTop: '1px' }}>{trip.banner.line2}</div>}
                </div>
              )}
            </div>
            {/* Content */}
            <div style={{ flex: 1, padding: '10px 12px', minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontFamily: 'monospace', fontSize: '9px', color: '#A8542F', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{trip.typ}</span>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#A8542F' }}>ab {trip.price?.toLocaleString('de-DE')} €</span>
              </div>
              <div style={{ fontFamily: "'Newsreader', serif", fontSize: '13px', color: '#16242B', lineHeight: 1.25, marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {trip.title}
              </div>
              <div style={{ fontSize: '10px', color: '#6B6457' }}>{trip.date}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
