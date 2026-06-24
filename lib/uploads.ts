import fs from 'fs';
import path from 'path';

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
