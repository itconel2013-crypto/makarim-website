import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { loadContent, saveContent, invalidateContentCache } from '@/lib/db';
import { MediaItem } from '@/lib/content-schema';
import { getUploadDir, extFromMime } from '@/lib/uploads';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * One-time, idempotent migration: extract legacy base64 ("data:image/...")
 * images out of the content blob, write them as files into the uploads dir
 * and replace each field with a "/api/uploads/<file>" URL. This removes the
 * multi-MB base64 payload from /api/content and every server-rendered page.
 *
 * Protected like app/api/admin/fix-trust: requires a valid admin session.
 * Safe to run multiple times — non-data: values are left untouched.
 */

const DATA_URL_RE = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/s;

interface MigrateState {
  dir: string;
  media: MediaItem[];
  migrated: number;
  skipped: number;
}

/**
 * If `value` is a base64 data URL, persist it to disk and return the new
 * "/api/uploads/<file>" URL. Otherwise return the value unchanged.
 * `register` adds a new media-library entry; skip it when the value already
 * IS a media-library entry (avoids duplicates) — only its url is rewritten.
 */
function migrateValue(value: unknown, label: string, st: MigrateState, register = true): unknown {
  if (typeof value !== 'string') return value;
  const m = value.match(DATA_URL_RE);
  if (!m) {
    if (value) st.skipped++;
    return value;
  }
  const mime = m[1];
  const ext = extFromMime(mime);
  const buffer = Buffer.from(m[2], 'base64');
  const id = crypto.randomUUID();
  const filename = `${id}${ext}`;
  fs.writeFileSync(path.join(st.dir, filename), buffer);
  const url = `/api/uploads/${filename}`;
  if (register) {
    st.media.push({ id, url, name: `${label}${ext}`, uploadedAt: new Date().toISOString() });
  }
  st.migrated++;
  return url;
}

export async function POST(request: NextRequest) {
  const session = request.cookies.get('makarim_session')?.value ?? '';
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const store = await loadContent();
  const bytesBefore = Buffer.byteLength(JSON.stringify(store));

  const st: MigrateState = {
    dir: getUploadDir(),
    media: [...(store.media ?? [])],
    migrated: 0,
    skipped: 0,
  };

  const c = store.c;

  // home.heroUrl
  if (c.home) {
    c.home.heroUrl = migrateValue(c.home.heroUrl, 'hero', st) as string | undefined;
  }

  // categories[].imageUrl
  for (const cat of c.categories ?? []) {
    cat.imageUrl = migrateValue(cat.imageUrl, `kategorie-${cat.key ?? cat.url}`, st) as string | undefined;
  }

  // about.url / about.url2
  if (c.about) {
    c.about.url = migrateValue(c.about.url, 'about-1', st) as string | undefined;
    c.about.url2 = migrateValue(c.about.url2, 'about-2', st) as string | undefined;
  }

  // trips[].hotels[].photo
  for (const trip of c.trips ?? []) {
    for (const hotel of trip.hotels ?? []) {
      hotel.photo = migrateValue(hotel.photo, `hotel-${trip.vg}`, st) as string | undefined;
    }
  }

  // media[] library entries that still hold base64 in their url (rewrite in place)
  for (const item of st.media) {
    const migrated = migrateValue(item.url, `media-${item.name ?? item.id}`, st, false);
    if (migrated !== item.url) item.url = migrated as string;
  }

  await saveContent({ ...store, media: st.media });
  invalidateContentCache();
  revalidatePath('/', 'layout');

  const after = await loadContent();
  const bytesAfter = Buffer.byteLength(JSON.stringify(after));

  return NextResponse.json({
    success: true,
    migrated: st.migrated,
    skipped: st.skipped,
    bytesBefore,
    bytesAfter,
    savedBytes: bytesBefore - bytesAfter,
  });
}
