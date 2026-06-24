// LOCAL ONLY: reproduce the ~13 MB production situation by injecting large
// base64 images into the content blob (home.heroUrl, categories[].imageUrl,
// about images). Lets us measure the "before" state locally, since the local
// DB ships empty. Run the migrate-images endpoint afterwards to see the effect.
//
// Usage: node scripts/seed-base64.mjs [targetMB]
//   node scripts/seed-base64.mjs 13

import Database from 'better-sqlite3';
import path from 'path';

const targetMB = Number(process.argv[2] ?? 13);
const dbPath = process.env.DATABASE_PATH ?? path.join(process.cwd(), 'makarim.db');

// Build a base64 JPEG-ish data URL of roughly `mb` megabytes.
function makeDataUrl(mb) {
  const bytes = Math.round(mb * 1024 * 1024);
  // base64 of repeated 0xFF bytes — size on the wire ≈ bytes * 4/3.
  const raw = Buffer.alloc(Math.round((bytes * 3) / 4), 0xff);
  return 'data:image/jpeg;base64,' + raw.toString('base64');
}

const db = new Database(dbPath);
db.exec(`CREATE TABLE IF NOT EXISTS cms_content (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  data TEXT NOT NULL,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);`);

const row = db.prepare('SELECT data FROM cms_content WHERE id = 1').get();
if (!row) {
  console.error('Keine cms_content-Zeile gefunden. Bitte zuerst die App einmal starten (seedet Default-Content).');
  process.exit(1);
}

const store = JSON.parse(row.data);
const cats = store.c.categories ?? [];
// Spread the target size across hero + category images + about images.
const slots = 2 + cats.length; // hero + about.url + about.url2 counted as 2, plus categories
const perSlotMB = targetMB / Math.max(1, slots);

store.c.home.heroUrl = makeDataUrl(perSlotMB);
if (store.c.about) {
  store.c.about.url = makeDataUrl(perSlotMB);
  store.c.about.url2 = makeDataUrl(perSlotMB);
}
for (const cat of cats) {
  cat.imageUrl = makeDataUrl(perSlotMB);
}

const json = JSON.stringify(store);
db.prepare('UPDATE cms_content SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1').run(json);
db.close();

console.log(`✓ Base64-Bilder injiziert. cms_content.data ≈ ${(Buffer.byteLength(json) / 1024 / 1024).toFixed(1)} MB`);
console.log('  Jetzt: npm run dev  →  node scripts/measure.mjs http://localhost:3000');
