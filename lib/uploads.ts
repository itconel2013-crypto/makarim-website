import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

/** Max width/height (px) for web delivery — large photos are downscaled to this. */
const MAX_DIMENSION = 1920;
const JPEG_QUALITY = 80;
const WEBP_QUALITY = 80;
/** Files at/below this size are considered already web-optimized and left alone. */
const WEB_SIZE_TARGET = 500 * 1024;

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
 * Re-optimize an already-stored file if it is either oversized (> MAX_DIMENSION)
 * OR still a heavy file (> WEB_SIZE_TARGET) — the latter catches web-sized but
 * poorly-compressed photos. Returns the optimized buffer, or null when the file
 * is already small enough. Because optimized real photos land below the target,
 * repeated migration runs converge and become no-ops (idempotent in practice).
 */
export async function optimizeForWebIfNeeded(buffer: Buffer, ext: string): Promise<Buffer | null> {
  const e = ext.toLowerCase();
  if (e === '.svg' || e === '.gif') return null;
  try {
    const meta = await sharp(buffer).metadata();
    const oversized = (meta.width ?? 0) > MAX_DIMENSION || (meta.height ?? 0) > MAX_DIMENSION;
    const heavy = buffer.length > WEB_SIZE_TARGET;
    if (!oversized && !heavy) return null;
    const out = await optimizeImageBuffer(buffer, ext);
    // Only accept a meaningful reduction (>10%). Recompressing an already-
    // optimized image saves almost nothing, so it's skipped → runs converge
    // and never degrade images through repeated recompression.
    return out.length > 0 && out.length < buffer.length * 0.9 ? out : null;
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
