import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { isAuthorized } from '@/lib/auth';
import { cleanLeadSource, cleanLeadSourceText, leadSourceLabel } from '@/lib/lead-source';
import { sendContactNotification } from '@/lib/email';

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
  // Nachträglich ergänzte Spalten („Wie bist du auf uns aufmerksam geworden?").
  // ALTER wirft, wenn die Spalte schon da ist — bestehende Datenbanken sollen
  // deshalb einfach weiterlaufen, nicht abbrechen.
  try { db.exec('ALTER TABLE contact_requests ADD COLUMN lead_source TEXT'); } catch {}
  try { db.exec('ALTER TABLE contact_requests ADD COLUMN lead_source_text TEXT'); } catch {}
  return db;
}

export async function POST(req: Request) {
  try {
    const { name, email, phone, interesse, message, leadSource, leadSourceText } = await req.json();
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Pflichtfelder fehlen' }, { status: 400 });
    }
    // Freiwillige Angabe: ungültige Werte werden still verworfen, die Anfrage
    // geht trotzdem durch. Eine Kontaktaufnahme darf daran nie scheitern.
    const source = cleanLeadSource(leadSource);
    const sourceText = source === 'sonstiges' ? cleanLeadSourceText(leadSourceText) : undefined;

    const db = ensureTable();
    db.prepare(
      'INSERT INTO contact_requests (name, email, phone, interesse, message, lead_source, lead_source_text) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(name, email, phone ?? '', interesse ?? '', message, source ?? null, sourceText ?? null);
    db.close();

    // Weiterleitung ans Büro. Bewusst NACH dem Speichern und ohne await:
    // Die Anfrage ist bereits sicher in der Datenbank, ein klemmender Mailserver
    // darf den Absender nie eine Fehlermeldung sehen lassen.
    if (process.env.SMTP_HOST) {
      sendContactNotification({
        name, email,
        phone:     phone ?? '',
        interesse: interesse ?? '',
        message,
        leadSourceLabel: leadSourceLabel(source),
        leadSourceText:  sourceText,
      }).catch((e) => console.error('Kontakt-Weiterleitung fehlgeschlagen:', e));
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Kontakt POST error:', e);
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 });
  }
}

/**
 * Kontaktanfragen enthalten Name, E-Mail, Telefonnummer und Nachrichtentext —
 * also personenbezogene Daten. Diese Route war früher OHNE Prüfung öffentlich
 * abrufbar: ein Aufruf von /api/kontakt gab die komplette Liste heraus.
 * Ab jetzt nur noch mit Admin-Sitzung oder gültigem API-Key.
 */
export async function GET(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const db = ensureTable();
    const rows = db.prepare('SELECT * FROM contact_requests ORDER BY created_at DESC').all();
    db.close();
    return NextResponse.json(rows, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    console.error('Kontakt GET error:', e);
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 });
  }
}
