/**
 * Instrumentation — runs at Next.js app startup
 * Initializes SQLite database if not already done
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const Database = (await import('better-sqlite3')).default;
      const { defaultContent } = await import('@/lib/seed-data');

      const dbPath = process.env.DATABASE_PATH ?? `${process.cwd()}/makarim.db`;
      const db = new Database(dbPath);
      db.pragma('journal_mode = WAL');

      // Create tables if not exists
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

      // Insert default if empty
      const existing = db.prepare('SELECT COUNT(*) as cnt FROM cms_content').get() as any;
      if (existing.cnt === 0) {
        db.prepare('INSERT INTO cms_content (id, data) VALUES (1, ?)').run(
          JSON.stringify(defaultContent)
        );
      }

      db.close();
      console.log('✓ Database initialized on app startup');
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }

    // Retry worker: re-send unsynced bookings to CRM every 5 minutes
    if (process.env.CRM_WEBHOOK_URL && process.env.CRON_SECRET) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? `http://localhost:${process.env.PORT ?? 3000}`;
      setInterval(async () => {
        try {
          await fetch(`${appUrl}/api/cron/retry-bookings`, {
            method: 'POST',
            headers: { 'x-cron-key': process.env.CRON_SECRET! },
          });
        } catch (e) {
          console.error('Retry-Worker fehlgeschlagen:', e);
        }
      }, 5 * 60 * 1_000);
      console.log('✓ CRM Retry-Worker gestartet (alle 5 Min)');
    }
  }
}
