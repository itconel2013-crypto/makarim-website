import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

/** Max width/height (px) for web delivery — large photos are downscaled to this. */
const MAX_DIMENSION = 1920;
const JPEG_QUALITY = 80;
const WEBP_QUALITY = 80;

/**
 * Resolve the directory where uploaded media files are stored.
 * In production (Railway) this lives next to the SQLite DB on the volume
 * (DATABASE_PATH); locally it falls back to <cwd>/uploads.
 * Creates the directory if it does not exist.
 */
export function getUploadDir(): string {
  const dataDir = process.env.DATABASE_PATH
    ? path.dirname(process.env.DATABASE_PATH)
    : path.join(process.cwd(), 'uploads');
  const dir = path.join(dataDir, 'uploads');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

/**
 * Resize (to MAX_DIMENSION) and recompress an image buffer for web delivery,
 * keeping the same format so the file extension / URL stays stable. SVG and
 * animated GIF are returned untouched. On any failure the original is returned,
 * so optimization can never break an upload.
 */
export async function optimizeImageBuffer(buffer: Buffer, ext: string): Promise<Buffer> {
  const e = ext.toLowerCase();
  if (e === '.svg' || e === '.gif') return buffer;
  try {
    let img = sharp(buffer, { failOn: 'none' }).rotate(); // auto-orient via EXIF
    const meta = await img.metadata();
    if ((meta.width ?? 0) > MAX_DIMENSION || (meta.height ?? 0) > MAX_DIMENSION) {
      img = img.resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: 'inside', withoutEnlargement: true });
    }
    if (e === '.png') return await img.png({ compressionLevel: 9, palette: true }).toBuffer();
    if (e === '.webp') return await img.webp({ quality: WEBP_QUALITY }).toBuffer();
    if (e === '.avif') return await img.avif({ quality: 60 }).toBuffer();
    return await img.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer();
  } catch {
    return buffer;
  }
}

/**
 * Re-optimize an already-stored file ONLY if it is oversized (larger than
 * MAX_DIMENSION in either axis). Returns the optimized buffer, or null when the
 * image is already web-sized — so repeated migration runs are idempotent and
 * don't recompress (and degrade) images that are already fine.
 */
export async function optimizeOversized(buffer: Buffer, ext: string): Promise<Buffer | null> {
  const e = ext.toLowerCase();
  if (e === '.svg' || e === '.gif') return null;
  try {
    const meta = await sharp(buffer).metadata();
    if ((meta.width ?? 0) <= MAX_DIMENSION && (meta.height ?? 0) <= MAX_DIMENSION) return null;
    const out = await optimizeImageBuffer(buffer, ext);
    return out.length > 0 && out.length < buffer.length ? out : null;
  } catch {
    return null;
  }
}

/** Map a data: URL image MIME type to a file extension. */
export function extFromMime(mime: string): string {
  const map: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'image/svg+xml': '.svg',
    'image/avif': '.avif',
  };
  return map[mime.toLowerCase()] ?? '.bin';
}
