// ============================================================================
// Booking price logic — single source of truth for the booking form (display)
// AND the server-side webhook to the CRM. Keep both in sync by importing here;
// the server recomputes the price (never trusts client-sent amounts).
// ============================================================================

export interface RoomType {
  value: string;   // code sent to the CRM: VZ | DZ3 | DZ
  label: string;
  mul: number;     // price multiplier on the trip base price
}

export const ROOM_TYPES: RoomType[] = [
  { value: 'VZ',  label: 'Vierbettzimmer', mul: 0.85 },
  { value: 'DZ3', label: 'Dreibettzimmer', mul: 0.91 },
  { value: 'DZ',  label: 'Doppelzimmer',   mul: 1.0 },
];

/** Multiplier applied to a child's price (age 2–11). */
export const KID_MULTIPLIER = 0.82;
/** Flat price for a baby (age 0–1), in EUR. */
export const BABY_PRICE = 250;

export type AgeCategory = 'Erwachsener' | 'Kind' | 'Baby';

export function roomPrice(basePrice: number, roomValue: string): number {
  const r = ROOM_TYPES.find((x) => x.value === roomValue) ?? ROOM_TYPES[0];
  return Math.round(basePrice * r.mul);
}

export function ageCategory(geburtstag: string): AgeCategory {
  if (!geburtstag) return 'Erwachsener';
  const ageMs = Date.now() - new Date(geburtstag).getTime();
  const years = ageMs / (1000 * 60 * 60 * 24 * 365.25);
  if (years < 2) return 'Baby';
  if (years < 12) return 'Kind';
  return 'Erwachsener';
}

export function personPrice(geburtstag: string, zimmer: string, basePrice: number): number {
  const cat = ageCategory(geburtstag);
  if (cat === 'Baby') return BABY_PRICE;
  const rp = roomPrice(basePrice, zimmer);
  return cat === 'Kind' ? Math.round(rp * KID_MULTIPLIER) : rp;
}

export interface PricedTraveler {
  geburtstag: string;
  zimmer: string;
}

/**
 * Compute the price per traveler (same order as input) and the grand total.
 * Used server-side to attach `gesamt` + `preisProPerson` to the CRM webhook.
 */
export function bookingPrices(travelers: PricedTraveler[], basePrice: number): {
  preisProPerson: number[];
  gesamt: number;
} {
  const preisProPerson = travelers.map((t) => personPrice(t.geburtstag, t.zimmer, basePrice));
  const gesamt = preisProPerson.reduce((sum, p) => sum + p, 0);
  return { preisProPerson, gesamt };
}
