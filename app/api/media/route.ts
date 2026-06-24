import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { loadContent, saveContent } from '@/lib/db';
import { isAuthorized } from '@/lib/auth';
import { MediaItem } from '@/lib/content-schema';
import { getUploadDir, optimizeImageBuffer } from '@/lib/uploads';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const store = await loadContent();
  return NextResponse.json(store.media ?? []);
}

export async function POST(request: NextRequest) {
  if (!(await isAuthorized(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const id = crypto.randomUUID();
    const ext = path.extname(file.name) || '.jpg';

    // Downscale + recompress for web before storing (full-res phone photos can
    // be several MB; the public site only needs a web-sized image). Photo PNGs
    // become WebP, so use the produced extension for the stored filename.
    const optimized = await optimizeImageBuffer(buffer, ext);
    const filename = `${id}${optimized.ext}`;
    fs.writeFileSync(path.join(getUploadDir(), filename), optimized.buffer);

    const item: MediaItem = {
      id,
      url: `/api/uploads/${filename}`,
      name: file.name,
      uploadedAt: new Date().toISOString(),
    };

    const store = await loadContent();
    await saveContent({ ...store, media: [...(store.media ?? []), item] });
    revalidatePath('/', 'layout');

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error('Media upload failed:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!(await isAuthorized(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id, alt, title } = await request.json();
  const store = await loadContent();
  const media = (store.media ?? []).map((m: MediaItem) =>
    m.id === id ? { ...m, alt, title } : m
  );
  await saveContent({ ...store, media });
  revalidatePath('/', 'layout');
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  if (!(await isAuthorized(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await request.json();
  const store = await loadContent();
  const item = (store.media ?? []).find((m: MediaItem) => m.id === id);

  if (item?.url?.startsWith('/api/uploads/')) {
    const filePath = path.join(getUploadDir(), path.basename(item.url));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  await saveContent({ ...store, media: (store.media ?? []).filter((m: MediaItem) => m.id !== id) });
  revalidatePath('/', 'layout');
  return NextResponse.json({ success: true });
}
