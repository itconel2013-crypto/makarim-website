import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { loadContent, saveContent, getDb, invalidateContentCache } from '@/lib/db';
import { isAuthorized } from '@/lib/auth';

/**
 * After any content write: drop the in-process cache and trigger on-demand
 * revalidation of all public pages so CMS changes are live immediately.
 */
function bustPublicCache(): void {
  invalidateContentCache();
  revalidatePath('/', 'layout');
}

function deepMerge(target: any, source: any): any {
  if (typeof source !== 'object' || source === null) return source;
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
      result[key] = deepMerge(target?.[key] ?? {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

/**
 * GET /api/content
 * Retrieve all CMS content
 */
export async function GET(request: NextRequest) {
  try {
    const content = await loadContent();
    // Strip bank details from public responses — they are only needed server-side
    if (!(await isAuthorized(request))) {
      const safe = { ...content, c: { ...content.c, brand: { ...content.c.brand, bank: undefined } } };
      return NextResponse.json(safe, {
        headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
      });
    }
    // Admin response: never cache (may contain bank details / drafts)
    return NextResponse.json(content, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('GET /api/content failed:', error);
    return NextResponse.json(
      { error: 'Failed to load content' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/content
 * Update CMS content (entire store or merge)
 */
export async function POST(request: NextRequest) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Basic structure validation (Fix 3)
    if (body.c !== undefined) {
      const c = body.c;
      if (typeof c !== 'object' || c === null) {
        return NextResponse.json({ error: 'Ungültige Struktur: c muss ein Objekt sein' }, { status: 400 });
      }
      if (c.trips !== undefined && !Array.isArray(c.trips)) {
        return NextResponse.json({ error: 'Ungültige Struktur: c.trips muss ein Array sein' }, { status: 400 });
      }
      if (Array.isArray(c.trips)) {
        for (const t of c.trips) {
          if (!t.vg || typeof t.vg !== 'string') return NextResponse.json({ error: 'Ungültige Reise: vg fehlt oder ist kein String' }, { status: 400 });
          if (t.price !== undefined && typeof t.price !== 'number') return NextResponse.json({ error: `Ungültige Reise ${t.vg}: price muss Zahl sein` }, { status: 400 });
          if (t.seats !== undefined && typeof t.seats !== 'number') return NextResponse.json({ error: `Ungültige Reise ${t.vg}: seats muss Zahl sein` }, { status: 400 });
          if (t.category !== undefined && !['umrah', 'hajj', 'kulturreisen'].includes(t.category)) {
            return NextResponse.json({ error: `Ungültige Reise ${t.vg}: unbekannte category "${t.category}"` }, { status: 400 });
          }
        }
      }
    }
    
    // Load current content and merge
    const current = await loadContent();
    const updated = { ...current, ...body };
    
    // Save to database
    await saveContent(updated);
    bustPublicCache();

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error('POST /api/content failed:', error);
    return NextResponse.json(
      { error: 'Failed to save content' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/content
 * Fast path: if body = { c: ... }, updates only the `c` field via json_set (1 write, no read).
 * Fallback: full deep-merge for other fields.
 */
export async function PATCH(request: NextRequest) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();

    // Targeted trip update (Fix 3B): PATCH { trip: Trip } merges only that trip by vg
    if (body.trip !== undefined && Object.keys(body).length === 1) {
      const trip = body.trip;
      if (!trip.vg) return NextResponse.json({ error: 'trip.vg fehlt' }, { status: 400 });
      const db = getDb();
      const row = db.prepare('SELECT data FROM cms_content WHERE id = 1').get() as any;
      const existing = row ? JSON.parse(row.data) : {};
      const trips: any[] = existing.c?.trips ?? [];
      const idx = trips.findIndex((t: any) => t.vg === trip.vg);
      // CMS-managed fields survive a CRM sync that doesn't (meaningfully) send them:
      // hero image (url), banner ("Balken auf dem Bild"), and per-hotel photo + nights.
      // Everything else (seats, price, prices, dates, hotel name/rating/dist, …) comes
      // from the CRM and overwrites.
      const mergeTrip = (prev: any, incoming: any) => {
        const merged = { ...prev, ...incoming };
        if (!incoming.url && prev.url) merged.url = prev.url;
        if (incoming.banner == null && prev.banner) merged.banner = prev.banner;
        // "Warteliste erlaubt" wird im CMS gesetzt → CMS-Wert gewinnt beim Sync.
        if (typeof prev.waitlist === 'boolean') merged.waitlist = prev.waitlist;
        if (Array.isArray(incoming.hotels)) {
          const prevHotels: any[] = Array.isArray(prev.hotels) ? prev.hotels : [];
          merged.hotels = incoming.hotels.map((h: any, i: number) => {
            const match = prevHotels.find((o: any) => o.city && h.city && String(o.city).toLowerCase() === String(h.city).toLowerCase()) ?? prevHotels[i];
            return {
              ...h,
              photo: h.photo || match?.photo,       // keep CMS photo
              nights: match?.nights || h.nights,    // keep CMS-pflegte Nächtezahl
            };
          });
        }
        return merged;
      };
      const updated = idx >= 0
        ? trips.map((t: any, i: number) => i === idx ? mergeTrip(t, trip) : t)
        : [...trips, trip];
      const newData = { ...existing, c: { ...existing.c, trips: updated } };
      db.prepare('UPDATE cms_content SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1').run(JSON.stringify(newData));
      db.close();
      bustPublicCache();
      return NextResponse.json({ success: true });
    }

    if (body.c !== undefined && Object.keys(body).length === 1) {
      // Fast path – read only raw JSON, replace c, write back (preserves media)
      const db = getDb();
      const row = db.prepare('SELECT data FROM cms_content WHERE id = 1').get() as any;
      const existing = row ? JSON.parse(row.data) : {};
      const updated = { ...existing, c: body.c };
      db.prepare('UPDATE cms_content SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1').run(JSON.stringify(updated));
      db.close();
      bustPublicCache();
      return NextResponse.json({ success: true });
    }

    // Fallback: full merge (used when media or other top-level fields are included)
    const current = await loadContent();
    const updated = deepMerge(current, body);
    await saveContent(updated);
    bustPublicCache();
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('PATCH /api/content failed:', error);
    return NextResponse.json({ error: 'Failed to update content' }, { status: 500 });
  }
}
