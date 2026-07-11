'use client';

import { useEffect } from 'react';

/**
 * Partner-/Empfehlungs-Tracking: Kommt ein Besucher über …?ref=<code>, wird die
 * Kennung in einem funktionalen Erstanbieter-Cookie (mk_ref, 60 Tage) gehalten und
 * bei einer späteren Buchung an das CRM mitgeschickt.
 *
 * Attribution = last-touch: ein neuer ref-Link überschreibt den alten.
 * (Für first-touch stattdessen nur setzen, wenn noch kein mk_ref existiert.)
 *
 * ref ist optional — fehlt es, passiert nichts.
 */
export function RefCapture() {
  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get('ref');
    if (!raw) return;
    const ref = raw.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 40);
    if (ref) document.cookie = `mk_ref=${ref}; path=/; max-age=${60 * 60 * 24 * 60}; samesite=lax`;
  }, []);

  return null;
}
