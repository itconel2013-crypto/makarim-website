import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { loadContent, saveContent, invalidateContentCache } from '@/lib/db';
import { MediaItem } from '@/lib/content-schema';
import { getUploadDir, extFromMime, optimizeImageBuffer, optimizeForWebIfNeeded } from '@/lib/uploads';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * One-time, idempotent migration + image optimization:
 *  1. Extract legacy base64 ("data:image/...") images out of the content blob,
 *     write them as optimized files, replace each field with "/api/uploads/<f>".
 *  2. Optimize every served image (downscale, recompress, photo-PNG → WebP) so
 *     the public site no longer ships full-resolution multi-MB photos.
 *
 * Protected like app/api/admin/fix-trust: requires a valid admin session.
 * Safe to run multiple times — already-migrated/optimized files are left as-is.
 */

const DATA_URL_RE = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/s;

interface MigrateState {
  dir: string;
  media: MediaItem[];
  migrated: number;
  skipped: number;
}

/**
 * If `value` is a base64 image data URL, optimize + write it to disk and return
 * the new "/api/uploads/<file>" URL. Otherwise return it unchanged.
 * `register` adds a new media-library entry; skip it for values that already
 * ARE media-library entries (avoids duplicates).
 */
async function migrateString(value: string, label: string, st: MigrateState, register: boolean): Promise<string> {
  const m = value.match(DATA_URL_RE);
  if (!m) {
    if (value.startsWith('data:')) st.skipped++; // a data: URL we don't handle
    return value;
  }
  const raw = Buffer.from(m[2], 'base64');
  const optimized = await optimizeImageBuffer(raw, extFromMime(m[1]));
  const id = crypto.randomUUID();
  const filename = `${id}${optimized.ext}`;
  fs.writeFileSync(path.join(st.dir, filename), optimized.buffer);
  const url = `/api/uploads/${filename}`;
  if (register) {
    st.media.push({ id, url, name: `${label}${optimized.ext}`, uploadedAt: new Date().toISOString() });
  }
  st.migrated++;
  return url;
}

/**
 * Recursively walk any object/array and replace every base64 image string in
 * place. Generic on purpose: production content may carry base64 in fields not
 * named in the schema, so we catch them all rather than enumerating known keys.
 */
async function walk(node: any, label: string, st: MigrateState, register: boolean): Promise<void> {
  if (node === null || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) {
      const v = node[i];
      if (typeof v === 'string') node[i] = await migrateString(v, `${label}-${i}`, st, register);
      else await walk(v, `${label}-${i}`, st, register);
    }
  } else {
    for (const k of Object.keys(node)) {
      const v = node[k];
      if (typeof v === 'string') node[k] = await migrateString(v, `${label}-${k}`, st, register);
      else await walk(v, `${label}-${k}`, st, register);
    }
  }
}

/** Collect every "/api/uploads/<file>" URL referenced anywhere in `node`. */
function collectUploadUrls(node: any, out: Set<string>): void {
  if (node === null || typeof node !== 'object') return;
  for (const v of Array.isArray(node) ? node : Object.values(node)) {
    if (typeof v === 'string') {
      if (v.startsWith('/api/uploads/')) out.add(v);
    } else {
      collectUploadUrls(v, out);
    }
  }
}

/** Rewrite any string in `node` that appears in `map` to its mapped value. */
function remapUrls(node: any, map: Map<string, string>): void {
  if (node === null || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) {
      const v = node[i];
      if (typeof v === 'string') { const nu = map.get(v); if (nu) node[i] = nu; }
      else remapUrls(v, map);
    }
  } else {
    for (const k of Object.keys(node)) {
      const v = node[k];
      if (typeof v === 'string') { const nu = map.get(v); if (nu) node[k] = nu; }
      else remapUrls(v, map);
    }
  }
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

  // 1) Extract every base64 image (named or not), optimized, registering each.
  await walk(store.c, 'content', st, true);

  // Existing media-library entries: rewrite base64 urls in place, no duplicates.
  for (const item of st.media) {
    if (typeof item.url === 'string') {
      const migrated = await migrateString(item.url, `media-${item.name ?? item.id}`, st, false);
      if (migrated !== item.url) item.url = migrated;
    }
  }

  // 2) Re-optimize files already on disk from earlier runs (full-size originals,
  //    photo-PNGs). Format changes (png → webp) rewrite the file + content URL.
  const referenced = new Set<string>();
  collectUploadUrls(store.c, referenced);
  for (const item of st.media) if (typeof item.url === 'string') referenced.add(item.url);

  const urlMap = new Map<string, string>();
  let imagesOptimized = 0;
  let imageBytesBefore = 0;
  let imageBytesAfter = 0;

  for (const url of referenced) {
    const filename = path.basename(url);
    const fp = path.join(st.dir, filename);
    let orig: Buffer;
    try { orig = fs.readFileSync(fp); } catch { continue; } // file missing — skip
    imageBytesBefore += orig.length;

    const result = await optimizeForWebIfNeeded(orig, path.extname(filename));
    if (!result) { imageBytesAfter += orig.length; continue; }

    if (result.ext.toLowerCase() === path.extname(filename).toLowerCase()) {
      fs.writeFileSync(fp, result.buffer); // same format — overwrite in place
    } else {
      const stem = filename.replace(/\.[^.]+$/, '');
      const newName = `${stem}${result.ext}`;
      fs.writeFileSync(path.join(st.dir, newName), result.buffer);
      try { fs.unlinkSync(fp); } catch {}
      urlMap.set(url, `/api/uploads/${newName}`);
    }
    imagesOptimized++;
    imageBytesAfter += result.buffer.length;
  }

  // Apply format-change URL remapping across content and media library.
  if (urlMap.size) {
    remapUrls(store.c, urlMap);
    for (const item of st.media) {
      const nu = urlMap.get(item.url);
      if (nu) { item.url = nu; item.name = item.name?.replace(/\.[^.]+$/, path.extname(nu)); }
    }
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
    imagesOptimized,
    convertedToWebp: urlMap.size,
    imageMBBefore: +(imageBytesBefore / 1024 / 1024).toFixed(2),
    imageMBAfter: +(imageBytesAfter / 1024 / 1024).toFixed(2),
    bytesBefore,
    bytesAfter,
    savedBytes: bytesBefore - bytesAfter,
  });
}
