import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

/** Max width/height (px) for web delivery — large photos are downscaled to this. */
const MAX_DIMENSION = 1920;
const JPEG_QUALITY = 80;
const WEBP_QUALITY = 80;
/** Files at/below this size are considered already web-optimized and left alone. */
const WEB_SIZE_TARGET = 500 * 1024;
/** PNGs larger than this are treated as photos and converted to WebP. */
const PNG_CONVERT_MIN = 100 * 1024;

export interface OptimizedImage {
  buffer: Buffer;
  /** Extension of the produced format (may differ from input, e.g. .png → .webp). */
  ext: string;
}

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
 * Resize (to MAX_DIMENSION) and recompress an image buffer for web delivery.
 * Photos stored as PNG are converted to WebP (much smaller, keeps transparency),
 * so the returned `ext` may differ from the input. SVG and animated GIF are
 * returned untouched. On any failure the original is returned, so optimization
 * can never break an upload.
 */
export async function optimizeImageBuffer(buffer: Buffer, ext: string): Promise<OptimizedImage> {
  const e = ext.toLowerCase();
  if (e === '.svg' || e === '.gif') return { buffer, ext: e };
  try {
    let img = sharp(buffer, { failOn: 'none' }).rotate(); // auto-orient via EXIF
    const meta = await img.metadata();
    if ((meta.width ?? 0) > MAX_DIMENSION || (meta.height ?? 0) > MAX_DIMENSION) {
      img = img.resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: 'inside', withoutEnlargement: true });
    }
    // PNG photos → WebP; .webp stays .webp; everything else → JPEG (keep ext).
    if (e === '.png' || e === '.webp') {
      return { buffer: await img.webp({ quality: WEBP_QUALITY }).toBuffer(), ext: '.webp' };
    }
    if (e === '.avif') return { buffer: await img.avif({ quality: 60 }).toBuffer(), ext: '.avif' };
    return { buffer: await img.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer(), ext: e };
  } catch {
    return { buffer, ext: e };
  }
}

/**
 * Re-optimize an already-stored file when it is worth it: oversized
 * (> MAX_DIMENSION), still heavy (> WEB_SIZE_TARGET), or a photo-sized PNG
 * (convertible to WebP). Returns the optimized image (possibly a new format),
 * or null when the file is already fine. Only a result that is a different
 * format OR a meaningful (>10%) size reduction is accepted, so repeated runs
 * converge and never degrade images through recompression.
 */
export async function optimizeForWebIfNeeded(buffer: Buffer, ext: string): Promise<OptimizedImage | null> {
  const e = ext.toLowerCase();
  if (e === '.svg' || e === '.gif') return null;
  try {
    const meta = await sharp(buffer).metadata();
    const oversized = (meta.width ?? 0) > MAX_DIMENSION || (meta.height ?? 0) > MAX_DIMENSION;
    const heavy = buffer.length > WEB_SIZE_TARGET;
    const pngPhoto = e === '.png' && buffer.length > PNG_CONVERT_MIN;
    if (!oversized && !heavy && !pngPhoto) return null;
    const out = await optimizeImageBuffer(buffer, ext);
    if (out.buffer.length === 0) return null;
    const changedFormat = out.ext.toLowerCase() !== e;
    const smaller = out.buffer.length < buffer.length * 0.9;
    return (changedFormat && out.buffer.length < buffer.length) || smaller ? out : null;
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
