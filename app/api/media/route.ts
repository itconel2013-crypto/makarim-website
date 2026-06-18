import { NextRequest, NextResponse } from 'next/server';
import { loadContent, saveContent } from '@/lib/db';
import { MediaItem } from '@/lib/content-schema';

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
    const b64   = Buffer.from(bytes).toString('base64');
    const mime  = file.type || 'image/jpeg';
    const url   = `data:${mime};base64,${b64}`;

    const item: MediaItem = {
      id:          crypto.randomUUID(),
      url,
      name:        file.name,
      uploadedAt:  new Date().toISOString(),
    };

    const store = await loadContent();
    const media = [...(store.media ?? []), item];
    await saveContent({ ...store, media });

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error('Media upload failed:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json();
  const store = await loadContent();
  const media = (store.media ?? []).filter((m: MediaItem) => m.id !== id);
  await saveContent({ ...store, media });
  return NextResponse.json({ success: true });
}
