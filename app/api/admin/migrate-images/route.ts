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
 *     write them as files into the uploads dir and replace each field with a
 *     "/api/uploads/<file>" URL (removes the multi-MB base64 payload).
 *  2. Optimize every served image (downscale + recompress) so the public site
 *     no longer ships full-resolution multi-MB photos.
 *
 * Protected like app/api/admin/fix-trust: requires a valid admin session.
 * Safe to run multiple times — already-migrated/optimized files are left as-is.
 */

const DATA_URL_RE = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/s;

interface PendingWrite {
  filename: string;
  buffer: Buffer;
  ext: string;
}

interface MigrateState {
  dir: string;
  media: MediaItem[];
  migrated: number;
  skipped: number;
  writes: PendingWrite[];
}

/**
 * If `value` is a base64 image data URL, queue it to be written to disk and
 * return the new "/api/uploads/<file>" URL. Otherwise return it unchanged.
 * `register` adds a new media-library entry; skip it when the value already
 * IS a media-library entry (avoids duplicates) — only its url is rewritten.
 */
function migrateString(value: string, label: string, st: MigrateState, register: boolean): string {
  const m = value.match(DATA_URL_RE);
  if (!m) {
    if (value.startsWith('data:')) st.skipped++; // a data: URL we don't handle
    return value;
  }
  const ext = extFromMime(m[1]);
  const buffer = Buffer.from(m[2], 'base64');
  const id = crypto.randomUUID();
  const filename = `${id}${ext}`;
  st.writes.push({ filename, buffer, ext });
  const url = `/api/uploads/${filename}`;
  if (register) {
    st.media.push({ id, url, name: `${label}${ext}`, uploadedAt: new Date().toISOString() });
  }
  st.migrated++;
  return url;
}

/**
 * Recursively walk any object/array and replace every base64 image string in
 * place. Generic on purpose: production content may carry base64 in fields not
 * named in the schema, so we catch them all rather than enumerating known keys.
 */
function walk(node: any, label: string, st: MigrateState, register: boolean): void {
  if (node === null || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) {
      const v = node[i];
      if (typeof v === 'string') node[i] = migrateString(v, `${label}-${i}`, st, register);
      else walk(v, `${label}-${i}`, st, register);
    }
  } else {
    for (const k of Object.keys(node)) {
      const v = node[k];
      if (typeof v === 'string') node[k] = migrateString(v, `${label}-${k}`, st, register);
      else walk(v, `${label}-${k}`, st, register);
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
    writes: [],
  };

  // Walk the whole content tree — catches every base64 field, named or not,
  // and registers each as a media-library entry.
  walk(store.c, 'content', st, true);

  // Existing media-library entries: rewrite base64 urls in place, no duplicates.
  for (const item of st.media) {
    if (typeof item.url === 'string') {
      const migrated = migrateString(item.url, `media-${item.name ?? item.id}`, st, false);
      if (migrated !== item.url) item.url = migrated;
    }
  }

  // Write newly-extracted images, optimized.
  for (const w of st.writes) {
    const optimized = await optimizeImageBuffer(w.buffer, w.ext);
    fs.writeFileSync(path.join(st.dir, w.filename), optimized);
  }

  // Re-optimize images that were already extracted to files in a previous run
  // (the full-resolution originals). Overwrite in place only if it gets smaller.
  const referenced = new Set<string>();
  collectUploadUrls(store.c, referenced);
  for (const item of st.media) if (typeof item.url === 'string') referenced.add(item.url);

  let imagesOptimized = 0;
  let imageBytesBefore = 0;
  let imageBytesAfter = 0;
  const justWritten = new Set(st.writes.map((w) => w.filename));

  for (const url of referenced) {
    const filename = path.basename(url);
    if (justWritten.has(filename)) {
      // already optimized above; still count its on-disk size
      try { imageBytesAfter += fs.statSync(path.join(st.dir, filename)).size; } catch {}
      continue;
    }
    const fp = path.join(st.dir, filename);
    let orig: Buffer;
    try { orig = fs.readFileSync(fp); } catch { continue; } // file missing — skip
    imageBytesBefore += orig.length;
    // Downscale oversized files and recompress heavy (but web-sized) ones;
    // already-small images are left untouched, so repeated runs converge.
    const optimized = await optimizeForWebIfNeeded(orig, path.extname(filename));
    if (optimized) {
      fs.writeFileSync(fp, optimized);
      imagesOptimized++;
      imageBytesAfter += optimized.length;
    } else {
      imageBytesAfter += orig.length;
    }
  }
  // account for the just-written optimized files in the "before" total too
  for (const w of st.writes) imageBytesBefore += w.buffer.length;

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
    imageMBBefore: +(imageBytesBefore / 1024 / 1024).toFixed(2),
    imageMBAfter: +(imageBytesAfter / 1024 / 1024).toFixed(2),
    bytesBefore,
    bytesAfter,
    savedBytes: bytesBefore - bytesAfter,
  });
}
