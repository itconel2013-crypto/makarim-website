import { NextRequest, NextResponse } from 'next/server';
import { isAuthorized } from '@/lib/auth';
import { getUploadDir } from '@/lib/uploads';
import fs from 'fs';
import path from 'path';

const MAX_BYTES = 20 * 1024 * 1024; // 20 MB

/**
 * PDF-Upload für Ratgeber-Dokumente. Speichert die Datei auf dem Volume (wie
 * Bilder, kein base64 in der DB) und gibt die URL zurück. Bewusst getrennt von
 * /api/media, damit PDFs nicht in der Bild-Mediathek auftauchen.
 */
export async function POST(request: NextRequest) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'Keine Datei' }, { status: 400 });

    const ext = path.extname(file.name).toLowerCase();
    if (ext !== '.pdf' && file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Nur PDF-Dateien erlaubt.' }, { status: 415 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.length > MAX_BYTES) {
      return NextResponse.json({ error: 'Datei zu groß (max. 20 MB).' }, { status: 413 });
    }
    // Inhalt gegenprüfen: echte PDFs beginnen mit "%PDF".
    if (buffer.subarray(0, 4).toString('latin1') !== '%PDF') {
      return NextResponse.json({ error: 'Die Datei ist kein gültiges PDF.' }, { status: 415 });
    }

    const filename = `${crypto.randomUUID()}.pdf`;
    fs.writeFileSync(path.join(getUploadDir(), filename), buffer);

    return NextResponse.json({ success: true, url: `/api/uploads/${filename}`, name: file.name });
  } catch (error) {
    console.error('Dokument-Upload fehlgeschlagen:', error);
    return NextResponse.json({ error: 'Upload fehlgeschlagen.' }, { status: 500 });
  }
}
