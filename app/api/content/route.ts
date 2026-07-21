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

/**
 * Diagnose-Log: meldet, wenn eine eingehende Reise ihre (im CMS vorhandenen)
 * Hotels verlieren würde — z. B. weil der CRM-Sync eine leere Hotelliste schickt.
 * So sehen wir in den Railway-Logs, über welchen Endpoint der Verlust reinkommt.
 */
function warnOnHotelLoss(prevTrips: any[], nextTrips: any[], via: string): void {
  if (!Array.isArray(prevTrips) || !Array.isArray(nextTrips)) return;
  for (const next of nextTrips) {
    const prev = prevTrips.find((t) => t.vg === next.vg);
    const prevCount = Array.isArray(prev?.hotels) ? prev.hotels.length : 0;
    const nextCount = Array.isArray(next?.hotels) ? next.hotels.length : 0;
    if (prevCount > 0 && nextCount === 0) {
      console.warn(`[Hotel-Schutz/${via}] Reise ${next.vg}: eingehende Hotelliste leer/fehlt (vorher ${prevCount}). CMS-Hotels werden bewahrt.`);
    }
  }
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
    if (body.c?.trips) warnOnHotelLoss((current as any).c?.trips ?? [], body.c.trips, 'POST');
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
      warnOnHotelLoss(trips, [trip], 'PATCH trip');
      // Diagnose: bei Umbenennung sehen wir hier, welche Namens-/URL-Felder das CRM
      // schickt und ob title/slug auseinanderlaufen (title-Anzeige vs. URL).
      {
        const p = trips[idx];
        const inc = `title=${JSON.stringify(trip.title)} name=${JSON.stringify(trip.name)} slug=${JSON.stringify(trip.slug)} url=${JSON.stringify(trip.url)}`;
        const old = p ? `title=${JSON.stringify(p.title)} slug=${JSON.stringify(p.slug)}` : '(neu)';
        if (!p || trip.title !== p.title || trip.slug !== p.slug || trip.url !== p.url) {
          console.log(`[Trip-Sync] ${trip.vg} · eingehend: ${inc} | bisher: ${old}`);
        }
      }
      // CMS-managed fields survive a CRM sync that doesn't (meaningfully) send them:
      // hero image (url), banner ("Balken auf dem Bild"), and per-hotel photo + nights.
      // Everything else (seats, price, prices, dates, hotel name/rating/dist, …) comes
      // from the CRM and overwrites.
      const mergeTrip = (prev: any, incoming: any) => {
        const merged = { ...prev, ...incoming };
        if (prev.url) merged.url = prev.url;
        if (incoming.banner == null && prev.banner) merged.banner = prev.banner;
        // "Warteliste erlauben" steuert jetzt das CRM (Quelle der Wahrheit): schickt es einen
        // Boolean, gewinnt der CRM-Wert; nur wenn das CRM nichts schickt, bleibt der CMS-Wert.
        if (typeof incoming.waitlist !== 'boolean' && typeof prev.waitlist === 'boolean') merged.waitlist = prev.waitlist;
        // CMS-eigene Inhaltsfelder: der CMS-Wert gewinnt bei Re-Syncs (bei der
        // Erst-Anlage einer Reise – ohne prev – kommen die CRM-Werte durch).
        // slug gehört dazu: URLs bleiben stabil, egal was im CRM passiert.
        // program (Reiseverlauf) und text (Langtext der Detailseite) werden ausschließlich hier
        // im CMS gepflegt (CMS-Editor „Langtext – Reise-Detailseite"). Das CRM hat dafür kein
        // Eingabefeld und schickt bei Duplikaten nur Altwerte mit → ohne Bewahrung würde jeder
        // CRM-Sync den gepflegten Website-Inhalt überschreiben.
        for (const f of ['slug', 'leaderPhoto', 'leaderPhotos', 'services', 'program', 'text', 'badge', 'startseite', 'seoTitle', 'seoDesc', 'sectionOrder'] as const) {
          merged[f] = prev[f];
        }
        // Überschrift (title): CRM führt, CMS darf übersteuern.
        //  • Ohne Override folgt sie dem CRM-NAMEN (nicht incoming.title: das CRM-eigene
        //    title-Feld kann bei alten Duplikaten veraltet sein und hat dort keine Pflege-UI).
        //    → Umbenennen im CRM wirkt beim nächsten Sync auf die Website.
        //  • Mit Override (im CMS-Editor gesetzt) bleibt der CMS-Titel unangetastet.
        //    Ein leerer Override zählt nicht — sonst stünde eine leere H1 auf der Seite.
        const override = prev.titleOverride === true && String(prev.title ?? '').trim() !== '';
        merged.title = override ? prev.title : (incoming.name ?? incoming.title ?? prev.title);
        merged.titleOverride = override;
        // Hotel-Datenhoheit:
        //  • CRM besitzt: die Hotelliste (welche/wie viele), city und name → überschreibt.
        //  • CMS besitzt: photo (Bild), nights, rating, dist → müssen den Sync überleben.
        // Schickt das CRM keine/leere Hotelliste, bleibt der komplette CMS-Stand erhalten.
        const prevHotels: any[] = Array.isArray(prev.hotels) ? prev.hotels : [];
        if (Array.isArray(incoming.hotels) && incoming.hotels.length > 0) {
          merged.hotels = incoming.hotels.map((h: any, i: number) => {
            // Zuordnung über city (CRM-stabil), sonst per Position.
            const match = prevHotels.find((o: any) => o.city && h.city && String(o.city).toLowerCase() === String(h.city).toLowerCase()) ?? prevHotels[i];
            return {
              ...h,                                  // city + name vom CRM
              photo:  match?.photo  || h.photo,      // CMS-Bild gewinnt
              nights: match?.nights || h.nights,     // CMS-Wert gewinnt
              rating: match?.rating || h.rating,     // CMS-Wert gewinnt
              dist:   match?.dist   || h.dist,       // CMS-Wert gewinnt
            };
          });
        } else {
          merged.hotels = prevHotels;               // CRM sendet keine Hotels → CMS-Stand behalten
        }
        return merged;
      };
      const updated = idx >= 0
        ? trips.map((t: any, i: number) => i === idx ? mergeTrip(t, trip) : t)
        // Erst-Anlage: Überschrift startet als CRM-Name (das CRM-title-Feld kann bei alten
        // Duplikaten veraltet sein) — ab dann gilt die Merge-Regel oben.
        : [...trips, { ...trip, title: trip.name ?? trip.title, titleOverride: false }];
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
      warnOnHotelLoss(existing.c?.trips ?? [], body.c?.trips ?? [], 'PATCH c');
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
