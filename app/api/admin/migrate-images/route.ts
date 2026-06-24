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
 * If `value` is a base64 image data URL, persist it to disk and return the new
 * "/api/uploads/<file>" URL. Otherwise return the value unchanged.
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
  fs.writeFileSync(path.join(st.dir, filename), buffer);
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
