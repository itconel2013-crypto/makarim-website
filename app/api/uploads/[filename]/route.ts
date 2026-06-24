import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { getUploadDir } from '@/lib/uploads';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  const safe = path.basename(filename);
  const filePath = path.join(getUploadDir(), safe);

  let buffer: Buffer;
  try {
    // Async read — never blocks the event loop while serving large images.
    buffer = await fs.readFile(filePath);
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const ext = path.extname(safe).toLowerCase();
  const mimeMap: Record<string, string> = {
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
    '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.avif': 'image/avif',
  };

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': mimeMap[ext] ?? 'application/octet-stream',
      'Content-Length': String(buffer.length),
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
