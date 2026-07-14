'use client';

import { Trip } from '@/lib/content-schema';

/**
 * Löscht eine Reise aus dem CMS — mit Sicherheitsabfrage.
 *
 * Vorher wird geprüft, ob zu der Reise noch aktive Buchungen existieren. Die
 * Buchungen selbst werden NICHT gelöscht (sie liegen in einer eigenen Tabelle),
 * verlieren aber ihren Bezug zur Reise — darauf wird ausdrücklich hingewiesen.
 *
 * Hinweis: Das CRM meldet Löschungen nicht ans CMS — im CRM entfernte Reisen
 * müssen hier manuell weggeräumt werden.
 */
export async function confirmAndDeleteTrip(
  trip: Trip,
  allTrips: Trip[],
  updateSection: (section: 'trips', data: Trip[]) => void,
): Promise<void> {
  let bookings: number | null = null;
  try {
    const res = await fetch('/api/admin/bookings');
    if (res.ok) {
      const rows = await res.json();
      bookings = Array.isArray(rows) ? rows.filter((r: any) => r.trip_vg === trip.vg).length : null;
    }
  } catch {
    bookings = null; // Zählung fehlgeschlagen → ehrlich sagen statt „0“ vortäuschen
  }

  const bookingLine =
    bookings === null
      ? '\n\nHinweis: Die Buchungen konnten gerade nicht geprüft werden.'
      : bookings > 0
        ? `\n\n⚠️ ACHTUNG: Zu dieser Reise gibt es noch ${bookings} aktive Buchung(en).\nDie Buchungen bleiben erhalten, verlieren aber ihren Bezug zur Reise.`
        : '\n\nZu dieser Reise gibt es keine aktiven Buchungen.';

  const ok = window.confirm(
    `Reise „${trip.title}“ (${trip.vg}) endgültig aus dem CMS löschen?` +
      bookingLine +
      '\n\nDie Reise-Seite ist danach nicht mehr erreichbar (404). Das lässt sich nicht rückgängig machen.',
  );
  if (!ok) return;

  updateSection('trips', allTrips.filter((t) => t.vg !== trip.vg));
}
