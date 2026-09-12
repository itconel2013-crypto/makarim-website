import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { isAuthorized } from '@/lib/auth';
import { cleanLeadSource, cleanLeadSourceText, leadSourceLabel } from '@/lib/lead-source';
import { sendContactNotification } from '@/lib/email';
import { clientIp, rateLimit, cap } from '@/lib/rate-limit';

/** Höchstlängen je Feld. Alles darüber wird abgeschnitten, nicht abgelehnt. */
const MAX = { name: 120, email: 200, phone: 60, interesse: 80, message: 5000 };

/** Fünf Anfragen pro Stunde und Absender — reicht für jeden echten Interessenten. */
const LIMIT = 5;
const WINDOW_MS = 60 * 60 * 1000;

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { leadSource, leadSourceText, website } = body;

    // Honeypot: `website` ist im Formular unsichtbar und für Menschen nicht
    // erreichbar. Füllt es jemand aus, war es ein Bot. Wir antworten trotzdem
    // mit Erfolg — sonst lernt der Bot, dass er erkannt wurde, und versucht es
    // anders. Gespeichert und versendet wird nichts.
    if (typeof website === 'string' && website.trim() !== '') {
      console.warn('Kontaktformular: Honeypot ausgelöst (' + clientIp(req) + ')');
      return NextResponse.json({ ok: true });
    }

    // Bremse gegen massenhaftes Absenden. Seit die Anfragen als E-Mail ins Büro
    // gehen, wäre das Formular sonst ein bequemer Weg, das Postfach zu fluten.
    const limited = rateLimit('kontakt:' + clientIp(req), LIMIT, WINDOW_MS);
    if (!limited.ok) {
      return NextResponse.json(
        { error: 'Zu viele Anfragen. Bitte versuche es später noch einmal oder ruf uns direkt an.' },
        { status: 429, headers: { 'Retry-After': String(limited.retryAfterSec) } },
      );
    }

    // Längengrenzen: abschneiden statt ablehnen — eine echte Anfrage soll nie an
    // einer Formalie scheitern, aber auch kein Megabyte in die Datenbank schreiben.
    const name      = cap(body.name, MAX.name);
    const email     = cap(body.email, MAX.email);
    const phone     = cap(body.phone, MAX.phone);
    const interesse = cap(body.interesse, MAX.interesse);
    const message   = cap(body.message, MAX.message);

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Pflichtfelder fehlen' }, { status: 400 });
    }
    if (!email.includes('@') || !email.includes('.')) {
      return NextResponse.json({ error: 'Bitte eine gültige E-Mail-Adresse angeben' }, { status: 400 });
    }

    // Freiwillige Angabe: ungültige Werte werden still verworfen, die Anfrage
    // geht trotzdem durch. Eine Kontaktaufnahme darf daran nie scheitern.
    const source = cleanLeadSource(leadSource);
    const sourceText = source === 'sonstiges' ? cleanLeadSourceText(leadSourceText) : undefined;

    const db = ensureTable();
    db.prepare(
      'INSERT INTO contact_requests (name, email, phone, interesse, message, lead_source, lead_source_text) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(name, email, phone, interesse, message, source ?? null, sourceText ?? null);
    db.close();

    // Weiterleitung ans Büro. Bewusst NACH dem Speichern und ohne await:
    // Die Anfrage ist bereits sicher in der Datenbank, ein klemmender Mailserver
    // darf den Absender nie eine Fehlermeldung sehen lassen.
    if (process.env.SMTP_HOST) {
      sendContactNotification({
        name, email, phone, interesse, message,
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
