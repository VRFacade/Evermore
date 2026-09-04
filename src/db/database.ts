import * as SQLite from 'expo-sqlite';

export const DATABASE_NAME = 'evermore.db';
export const DATABASE_VERSION = 1;

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

/**
 * Open (or reuse) the Evermore SQLite database.
 * Schema is created/migrated lazily on first open, which happens on first Lists write/read.
 */
export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
      await db.execAsync('PRAGMA foreign_keys = ON;');
      await migrateDbIfNeeded(db);
      return db;
    })();
  }
  return dbPromise;
}

/**
 * Versioned migration path using PRAGMA user_version.
 * Bump DATABASE_VERSION and append a new `if (currentDbVersion === N)` block for future schema changes.
 */
export async function migrateDbIfNeeded(db: SQLite.SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let currentDbVersion = row?.user_version ?? 0;

  if (currentDbVersion >= DATABASE_VERSION) {
    return;
  }

  if (currentDbVersion === 0) {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS lists (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        name TEXT NOT NULL CHECK (length(trim(name)) > 0),
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS list_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        list_id INTEGER NOT NULL,
        title TEXT NOT NULL CHECK (length(trim(title)) > 0),
        completed INTEGER NOT NULL DEFAULT 0 CHECK (completed IN (0, 1)),
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_list_items_list_id ON list_items(list_id);
    `);
    currentDbVersion = 1;
  }

  // Future migrations:
  // if (currentDbVersion === 1) { ...; currentDbVersion = 2; }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
