// ============================================================================
// Booking price logic — single source of truth for the booking form (display),
// the detail-page price table AND the server-side webhook to the CRM.
//
// Since Option 1, the CRM sends EXPLICIT per-room, per-age prices in trip.prices.
// When present, those values are authoritative — we never apply factors to a set
// value. The old 0.82 / 250€ factors survive only as a per-null fallback (a single
// child/baby that the CRM left null) and as a full fallback for legacy trips that
// carry no `prices` at all (derived from the single `trip.price`).
// ============================================================================

import { RoomPrice, TripPrices } from './content-schema';

export interface RoomType {
  value: string;   // code sent to the CRM: VZ | DZ3 | DZ
  label: string;
  mul: number;     // legacy multiplier on trip.price (only used when prices absent)
}

export const ROOM_TYPES: RoomType[] = [
  { value: 'VZ',  label: 'Vierbettzimmer', mul: 0.85 },
  { value: 'DZ3', label: 'Dreibettzimmer', mul: 0.91 },
  { value: 'DZ',  label: 'Doppelzimmer',   mul: 1.0 },
];

/** Fallback factor for a child (age 2–11) when the CRM child price is null. */
export const KID_MULTIPLIER = 0.82;
/** Fallback flat price for a baby (age 0–1) when the CRM baby price is null. */
export const BABY_PRICE = 250;

/** Map the booking room code to the CRM price key. */
const ZIMMER_TO_KEY: Record<string, keyof TripPrices> = { VZ: 'quad', DZ3: 'tpl', DZ: 'dbl' };

export type AgeCategory = 'Erwachsener' | 'Kind' | 'Baby';

/** What the pricing needs from a trip. */
export interface TripPricing {
  price?: number;
  prices?: TripPrices;
}

export interface EffectiveRoomPrice { adult: number; child: number; baby: number; }

export function ageCategory(geburtstag: string): AgeCategory {
  if (!geburtstag) return 'Erwachsener';
  const ageMs = Date.now() - new Date(geburtstag).getTime();
  const years = ageMs / (1000 * 60 * 60 * 24 * 365.25);
  if (years < 2) return 'Baby';
  if (years < 12) return 'Kind';
  return 'Erwachsener';
}

/**
 * Effective per-person prices for a room, or null if the room is not offered.
 * With explicit prices: use CRM values; a null child/baby falls back to the
 * factor rule. Without explicit prices: derive everything from trip.price.
 */
export function effectiveRoomPrice(trip: TripPricing, roomValue: string): EffectiveRoomPrice | null {
  const key = ZIMMER_TO_KEY[roomValue];

  if (trip.prices) {
    const rp: RoomPrice | null | undefined = key ? trip.prices[key] : null;
    if (!rp || typeof rp.adult !== 'number') return null; // category not offered
    const adult = rp.adult;
    const child = typeof rp.child === 'number' ? rp.child : Math.round(adult * KID_MULTIPLIER);
    const baby  = typeof rp.baby  === 'number' ? rp.baby  : BABY_PRICE;
    return { adult, child, baby };
  }

  // Legacy: single price × room multiplier, child/baby via factors.
  const base = trip.price ?? 0;
  const room = ROOM_TYPES.find((r) => r.value === roomValue) ?? ROOM_TYPES[0];
  const adult = Math.round(base * room.mul);
  return { adult, child: Math.round(adult * KID_MULTIPLIER), baby: BABY_PRICE };
}

/** Room categories bookable for this trip (only those the CRM actually prices). */
export function availableRooms(trip: TripPricing): RoomType[] {
  if (!trip.prices) return ROOM_TYPES;
  return ROOM_TYPES.filter((r) => {
    const rp = trip.prices![ZIMMER_TO_KEY[r.value]];
    return rp && typeof rp.adult === 'number';
  });
}

/** Price for one traveler given birth date, room and the trip's prices. */
export function personPrice(geburtstag: string, zimmer: string, trip: TripPricing): number {
  let eff = effectiveRoomPrice(trip, zimmer);
  if (!eff) {
    // Safety: an unoffered room slipped through — never charge 0, derive legacy.
    const base = trip.price ?? 0;
    const room = ROOM_TYPES.find((r) => r.value === zimmer) ?? ROOM_TYPES[0];
    const adult = Math.round(base * room.mul);
    eff = { adult, child: Math.round(adult * KID_MULTIPLIER), baby: BABY_PRICE };
  }
  const cat = ageCategory(geburtstag);
  if (cat === 'Baby') return eff.baby;
  if (cat === 'Kind') return eff.child;
  return eff.adult;
}

export interface PricedTraveler {
  geburtstag: string;
  zimmer: string;
}

/**
 * Per-traveler prices (same order as input) and the grand total. Used server-side
 * to attach `gesamt` + `preisProPerson` to the CRM webhook.
 */
export function bookingPrices(travelers: PricedTraveler[], trip: TripPricing): {
  preisProPerson: number[];
  gesamt: number;
} {
  const preisProPerson = travelers.map((t) => personPrice(t.geburtstag, t.zimmer, trip));
  const gesamt = preisProPerson.reduce((sum, p) => sum + p, 0);
  return { preisProPerson, gesamt };
}
