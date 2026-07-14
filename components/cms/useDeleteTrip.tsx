'use client';

import { useState } from 'react';
import { Trip } from '@/lib/content-schema';

/** undefined = Buchungen werden noch geprüft, null = Prüfung fehlgeschlagen */
type BookingCount = number | null | undefined;

function DeleteTripDialog({
  trip, bookings, onCancel, onConfirm,
}: {
  trip: Trip;
  bookings: BookingCount;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const loading = bookings === undefined;
  const hasBookings = typeof bookings === 'number' && bookings > 0;

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(22,36,43,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="del-title"
    >
      <div style={{ background: '#FAF7F4', borderRadius: '16px', width: '520px', maxWidth: '100%', overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.22)' }}>
        {/* Kopf */}
        <div style={{ padding: '22px 26px 0' }}>
          <h2 id="del-title" className="font-serif" style={{ fontSize: '22px', fontWeight: 400, color: '#16242B', margin: 0 }}>
            Reise löschen?
          </h2>
          <p style={{ fontSize: '14px', color: '#5A5448', margin: '10px 0 0', lineHeight: 1.55 }}>
            Du bist dabei, <strong style={{ color: '#16242B' }}>„{trip.title}“</strong>{' '}
            <span style={{ fontFamily: 'monospace', fontSize: '12.5px', color: '#9A9082' }}>({trip.vg})</span>{' '}
            endgültig aus dem CMS zu löschen.
          </p>
        </div>

        {/* Buchungs-Status */}
        <div style={{ padding: '16px 26px 0' }}>
          {loading ? (
            <div style={{ borderRadius: '10px', border: '1px solid #EAE3D8', background: '#FDFCF9', padding: '12px 14px', fontSize: '13.5px', color: '#9A9082' }}>
              Buchungen werden geprüft …
            </div>
          ) : hasBookings ? (
            <div style={{ borderRadius: '10px', border: '1px solid #F5C9C0', background: '#FDF3F1', padding: '12px 14px', display: 'flex', gap: '10px' }}>
              <span style={{ flexShrink: 0 }}>⚠️</span>
              <p style={{ fontSize: '13.5px', color: '#8F3E2C', margin: 0, lineHeight: 1.55 }}>
                Zu dieser Reise gibt es noch <strong>{bookings} aktive Buchung{bookings === 1 ? '' : 'en'}</strong>.
                Die Buchungen bleiben erhalten, verlieren aber ihren Bezug zur Reise.
              </p>
            </div>
          ) : bookings === null ? (
            <div style={{ borderRadius: '10px', border: '1px solid #F0E0BC', background: '#FFFBEA', padding: '12px 14px', fontSize: '13.5px', color: '#7A5B1E', lineHeight: 1.55 }}>
              Die Buchungen konnten gerade nicht geprüft werden — es ist also unklar, ob welche existieren.
            </div>
          ) : (
            <div style={{ borderRadius: '10px', border: '1px solid #D8E4D6', background: '#F2F7F1', padding: '12px 14px', fontSize: '13.5px', color: '#3E6B52', lineHeight: 1.55 }}>
              Zu dieser Reise gibt es keine aktiven Buchungen.
            </div>
          )}

          <p style={{ fontSize: '12.5px', color: '#9A9082', margin: '12px 0 0', lineHeight: 1.55 }}>
            Die Reise-Seite ist danach nicht mehr erreichbar (404). Das lässt sich nicht rückgängig machen.
            Existiert die Reise im CRM noch, kommt sie beim nächsten Sync zurück.
          </p>
        </div>

        {/* Aktionen */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '22px 26px' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{ background: '#EDE8E1', color: '#5A5448', border: 'none', borderRadius: '10px', padding: '10px 18px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
          >
            Abbrechen
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            style={{ background: '#B0563F', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 18px', fontSize: '14px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}
          >
            Endgültig löschen
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Löschen einer Reise mit eigenem Bestätigungs-Dialog (kein window.confirm).
 *
 * Vor dem Löschen werden die aktiven Buchungen zur `vg` gezählt und im Dialog
 * angezeigt. Die Buchungen selbst werden NICHT gelöscht — sie liegen in einer
 * eigenen Tabelle und verlieren lediglich ihren Bezug zur Reise.
 *
 * Rückgabe: `requestDelete(trip)` öffnet den Dialog, `dialog` muss gerendert werden.
 */
export function useDeleteTrip(
  allTrips: Trip[],
  updateSection: (section: 'trips', data: Trip[]) => void,
) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [bookings, setBookings] = useState<BookingCount>(undefined);

  const requestDelete = (t: Trip) => {
    setTrip(t);
    setBookings(undefined);
    fetch('/api/admin/bookings')
      .then((r) => (r.ok ? r.json() : null))
      .then((rows) => {
        setBookings(Array.isArray(rows) ? rows.filter((r: any) => r.trip_vg === t.vg).length : null);
      })
      .catch(() => setBookings(null));   // ehrlich „unbekannt“ statt „0“ vortäuschen
  };

  const close = () => { setTrip(null); setBookings(undefined); };

  const confirm = () => {
    if (!trip) return;
    updateSection('trips', allTrips.filter((t) => t.vg !== trip.vg));
    close();
  };

  const dialog = trip
    ? <DeleteTripDialog trip={trip} bookings={bookings} onCancel={close} onConfirm={confirm} />
    : null;

  return { requestDelete, dialog };
}
