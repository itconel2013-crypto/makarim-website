import Database from 'better-sqlite3';
import { defaultContent } from './seed-data';
import { Category, Trip, CMSStore } from './content-schema';

function normalizeCategory(category: any): Category {
  const key = category.key ?? category.url ?? category.title?.toLowerCase().replace(/\s+/g, '-') ?? 'category';
  return {
    key,
    name: category.name ?? category.title ?? category.url ?? key,
    title: category.title ?? category.name ?? category.url ?? key,
    description: category.description ?? category.text ?? '',
    text: category.text ?? category.description ?? '',
    icon: category.icon,
    url: category.url ?? key,
  };
}

function normalizeTrip(trip: any): Trip {
  const categoryKey = trip.category ?? (trip.typ ? trip.typ.toLowerCase() : undefined) ?? 'umrah';
  const slug = trip.slug ?? trip.url ?? trip.title?.toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/(^-|-$)/g, '') ?? trip.vg;
  return {
    ...trip,
    category: categoryKey,
    slug,
    name: trip.name ?? trip.title ?? slug,
    description: trip.description ?? trip.text ?? '',
    typ: trip.typ,
    nights: (trip.nights ?? parseInt(trip.nights as any, 10)) || 0,
    hotels: trip.hotels ?? [],
  };
}

function normalizeContent(content: any): CMSStore {
  if (!content || typeof content !== 'object') {
    return defaultContent;
  }

  const normalized = { ...defaultContent, ...content };

  if (Array.isArray(content.categories)) {
    normalized.categories = content.categories.map(normalizeCategory);
  }

  if (Array.isArray(content.trips)) {
    normalized.trips = content.trips.map(normalizeTrip);
  }

  if (!Array.isArray(normalized.faq)) {
    normalized.faq = defaultContent.c.faq;
  }

  return normalized as CMSStore;
}

/**
 * Get or create database connection
 */
export function getDb(): Database.Database {
  const dbPath = process.env.DATABASE_PATH ?? `${process.cwd()}/makarim.db`;
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  return db;
}

/**
 * Initialize database schema (sync)
 */
export async function initializeDb(): Promise<void> {
  const db = getDb();

  // Create content table if not exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS cms_content (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      data TEXT NOT NULL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS bookings (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_vg     TEXT NOT NULL,
      payload     TEXT NOT NULL,
      status      TEXT NOT NULL DEFAULT 'neu',
      email_sent  INTEGER NOT NULL DEFAULT 0,
      crm_synced  INTEGER NOT NULL DEFAULT 0,
      created_at  TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  // Insert default content if empty
  const existing = db.prepare('SELECT COUNT(*) as cnt FROM cms_content').get() as any;
  if (existing.cnt === 0) {
    db.prepare('INSERT INTO cms_content (id, data) VALUES (1, ?)').run(
      JSON.stringify(defaultContent)
    );
    console.log('✓ Database initialized with default content');
  } else {
    console.log('✓ Database already initialized');
  }
  
  db.close();
}

/**
 * Load content from database (sync)
 */
export async function loadContent(): Promise<CMSStore> {
  const db = getDb();

  // Auto-initialize table + seed if this is a fresh deployment (no DB file)
  db.exec(`
    CREATE TABLE IF NOT EXISTS cms_content (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      data TEXT NOT NULL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  let row = db.prepare('SELECT data FROM cms_content WHERE id = 1').get() as any;

  if (!row) {
    db.prepare('INSERT INTO cms_content (id, data) VALUES (1, ?)').run(
      JSON.stringify(defaultContent)
    );
    db.close();
    return defaultContent;
  }

  db.close();

  try {
    const parsed = JSON.parse(row.data);
    return normalizeContent(parsed);
  } catch (e) {
    console.error('Failed to parse content:', e);
    return defaultContent;
  }
}

/**
 * Save content to database (sync, wrapped in transaction)
 */
export async function saveContent(content: any): Promise<void> {
  const db = getDb();
  const run = db.transaction(() => {
    db.prepare(
      'UPDATE cms_content SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1'
    ).run(JSON.stringify(content));
  });
  run();
  db.close();
}

/** Save a new booking and return its id. */
export function saveBooking(tripVg: string, payload: object): number {
  const db = getDb();
  db.exec(`CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trip_vg TEXT NOT NULL,
    payload TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'neu',
    email_sent INTEGER NOT NULL DEFAULT 0,
    crm_synced INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );`);
  const result = db.prepare(
    'INSERT INTO bookings (trip_vg, payload) VALUES (?, ?)'
  ).run(tripVg, JSON.stringify(payload));
  db.close();
  return result.lastInsertRowid as number;
}

/** Mark a booking as emailed. */
export function markBookingEmailed(id: number): void {
  const db = getDb();
  db.prepare('UPDATE bookings SET email_sent = 1 WHERE id = ?').run(id);
  db.close();
}

/** Mark a booking as synced to CRM. */
export function markBookingSynced(id: number): void {
  const db = getDb();
  db.prepare('UPDATE bookings SET crm_synced = 1 WHERE id = ?').run(id);
  db.close();
}

/** Load all bookings not yet synced to CRM. */
export function loadUnsyncedBookings(): any[] {
  const db = getDb();
  db.exec(`CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trip_vg TEXT NOT NULL, payload TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'neu',
    email_sent INTEGER NOT NULL DEFAULT 0,
    crm_synced INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );`);
  const rows = db.prepare('SELECT * FROM bookings WHERE crm_synced = 0 ORDER BY created_at ASC').all();
  db.close();
  return rows;
}

/** Reduce seats for a trip by `count` (minimum 0). */
export async function decrementSeats(tripVg: string, count: number): Promise<void> {
  const db = getDb();
  const row = db.prepare('SELECT data FROM cms_content WHERE id = 1').get() as any;
  if (!row) { db.close(); return; }
  const data = JSON.parse(row.data);
  const trips: any[] = data.c?.trips ?? [];
  const updated = trips.map((t: any) => {
    if (t.vg !== tripVg) return t;
    const newSeats = Math.max(0, (t.seats ?? 0) - count);
    return { ...t, seats: newSeats, waitlist: newSeats === 0 && t.waitlist };
  });
  data.c = { ...data.c, trips: updated };
  db.prepare('UPDATE cms_content SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1').run(JSON.stringify(data));
  db.close();
}

/** Load all bookings (admin view). */
export function loadBookings(): any[] {
  const db = getDb();
  db.exec(`CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trip_vg TEXT NOT NULL,
    payload TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'neu',
    email_sent INTEGER NOT NULL DEFAULT 0,
    crm_synced INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );`);
  const rows = db.prepare('SELECT * FROM bookings ORDER BY created_at DESC').all();
  db.close();
  return rows;
}

/**
 * Reset to default content (sync)
 */
export async function resetToDefaults(): Promise<void> {
  const db = getDb();
  db.prepare('UPDATE cms_content SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1').run(
    JSON.stringify(defaultContent)
  );
  db.close();
  console.log('✓ Content reset to defaults');
}
