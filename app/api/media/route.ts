import { NextRequest, NextResponse } from 'next/server';
import { loadContent, saveContent } from '@/lib/db';
import { MediaItem } from '@/lib/content-schema';
import fs from 'fs';
import path from 'path';

function getUploadDir() {
  const dataDir = process.env.DATABASE_PATH
    ? path.dirname(process.env.DATABASE_PATH)
    : path.join(process.cwd(), 'uploads');
  const dir = path.join(dataDir, 'uploads');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export async function GET() {
  const store = await loadContent();
  return NextResponse.json(store.media ?? []);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const id = crypto.randomUUID();
    const ext = path.extname(file.name) || '.jpg';
    const filename = `${id}${ext}`;

    fs.writeFileSync(path.join(getUploadDir(), filename), buffer);

    const item: MediaItem = {
      id,
      url: `/api/uploads/${filename}`,
      name: file.name,
      uploadedAt: new Date().toISOString(),
    };

    const store = await loadContent();
    await saveContent({ ...store, media: [...(store.media ?? []), item] });

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error('Media upload failed:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json();
  const store = await loadContent();
  const item = (store.media ?? []).find((m: MediaItem) => m.id === id);

  if (item?.url?.startsWith('/api/uploads/')) {
    const filePath = path.join(getUploadDir(), path.basename(item.url));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  await saveContent({ ...store, media: (store.media ?? []).filter((m: MediaItem) => m.id !== id) });
  return NextResponse.json({ success: true });
}
