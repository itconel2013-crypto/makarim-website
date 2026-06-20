import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

function ensureTable() {
  const db = getDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS contact_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      interesse TEXT,
      message TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
  return db;
}

export async function POST(req: Request) {
  try {
    const { name, email, phone, interesse, message } = await req.json();
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Pflichtfelder fehlen' }, { status: 400 });
    }
    const db = ensureTable();
    db.prepare(
      'INSERT INTO contact_requests (name, email, phone, interesse, message) VALUES (?, ?, ?, ?, ?)'
    ).run(name, email, phone ?? '', interesse ?? '', message);
    db.close();
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Kontakt POST error:', e);
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const db = ensureTable();
    const rows = db.prepare('SELECT * FROM contact_requests ORDER BY created_at DESC').all();
    db.close();
    return NextResponse.json(rows);
  } catch (e) {
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 });
  }
}
