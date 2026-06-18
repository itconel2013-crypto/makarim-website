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
  const dbPath = `${process.cwd()}/makarim.db`;
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
  const row = db.prepare('SELECT data FROM cms_content WHERE id = 1').get() as any;
  db.close();
  
  if (!row) {
    return defaultContent;
  }
  
  try {
    const parsed = JSON.parse(row.data);
    return normalizeContent(parsed);
  } catch (e) {
    console.error('Failed to parse content:', e);
    return defaultContent;
  }
}

/**
 * Save content to database (sync)
 */
export async function saveContent(content: any): Promise<void> {
  const db = getDb();
  db.prepare(
    'UPDATE cms_content SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1'
  ).run(JSON.stringify(content));
  db.close();
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
