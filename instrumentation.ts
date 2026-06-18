/**
 * Instrumentation — runs at Next.js app startup
 * Initializes SQLite database if not already done
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const Database = (await import('better-sqlite3')).default;
      const { defaultContent } = await import('@/lib/seed-data');
      
      const dbPath = `${process.cwd()}/makarim.db`;
      const db = new Database(dbPath);
      db.pragma('journal_mode = WAL');
      
      // Create table if not exists
      db.exec(`
        CREATE TABLE IF NOT EXISTS cms_content (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          data TEXT NOT NULL,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP
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
  }
}
