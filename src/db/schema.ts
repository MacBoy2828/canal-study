import type { SQLiteDatabase } from 'expo-sqlite';

const DEFAULT_DISPLAY_LIMIT = 10;

type ColumnInfo = { name: string };

async function tableExists(db: SQLiteDatabase, name: string): Promise<boolean> {
  const row = await db.getFirstAsync<{ name: string }>(
    `SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?`,
    name
  );
  return !!row;
}

async function columnNames(
  db: SQLiteDatabase,
  table: string
): Promise<string[]> {
  const rows = await db.getAllAsync<ColumnInfo>(`PRAGMA table_info(${table})`);
  return rows.map((r) => r.name);
}

export const DATABASE_NAME = 'canal-study.db';

/**
 * Opens / migrates the on-device database.
 * Safe across APK updates: Android keeps app private storage when the same
 * package (`com.canalstudy.app`) is updated in place. Migrations only add
 * tables/columns or copy rows — they must never wipe user cards.
 */
export async function initDatabase(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS decks (
      id TEXT PRIMARY KEY NOT NULL,
      source_language TEXT NOT NULL,
      destination_language TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      display_limit INTEGER NOT NULL DEFAULT ${DEFAULT_DISPLAY_LIMIT},
      active_deck_id TEXT
    );
  `);

  await ensureSettingsColumns(db);
  await migrateOrCreateCards(db);

  await db.runAsync(
    `INSERT OR IGNORE INTO settings (id, display_limit, active_deck_id) VALUES (1, ?, NULL)`,
    DEFAULT_DISPLAY_LIMIT
  );
}

async function ensureSettingsColumns(db: SQLiteDatabase): Promise<void> {
  const cols = await columnNames(db, 'settings');
  if (!cols.includes('active_deck_id')) {
    await db.execAsync(
      `ALTER TABLE settings ADD COLUMN active_deck_id TEXT`
    );
  }
  if (!cols.includes('reminder_enabled')) {
    await db.execAsync(
      `ALTER TABLE settings ADD COLUMN reminder_enabled INTEGER NOT NULL DEFAULT 0`
    );
  }
  if (!cols.includes('reminder_hour')) {
    await db.execAsync(
      `ALTER TABLE settings ADD COLUMN reminder_hour INTEGER NOT NULL DEFAULT 19`
    );
  }
  if (!cols.includes('reminder_minute')) {
    await db.execAsync(
      `ALTER TABLE settings ADD COLUMN reminder_minute INTEGER NOT NULL DEFAULT 0`
    );
  }
}

async function migrateOrCreateCards(db: SQLiteDatabase): Promise<void> {
  const exists = await tableExists(db, 'cards');

  if (!exists) {
    await db.execAsync(`
      CREATE TABLE cards (
        id TEXT PRIMARY KEY NOT NULL,
        deck_id TEXT NOT NULL,
        source_text TEXT NOT NULL,
        destination_text TEXT NOT NULL,
        times_shown INTEGER NOT NULL DEFAULT 0,
        times_correct INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'active',
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE
      );
    `);
    return;
  }

  const cols = await columnNames(db, 'cards');
  if (cols.includes('source_text') && cols.includes('deck_id')) {
    return;
  }

  if (!cols.includes('dutch')) {
    return;
  }

  const now = Date.now();
  const deckId = `deck_${now.toString(36)}_legacy`;

  await db.runAsync(
    `INSERT INTO decks (id, source_language, destination_language, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?)`,
    deckId,
    'Dutch',
    'English',
    now,
    now
  );

  await db.execAsync(`
    CREATE TABLE cards_migrated (
      id TEXT PRIMARY KEY NOT NULL,
      deck_id TEXT NOT NULL,
      source_text TEXT NOT NULL,
      destination_text TEXT NOT NULL,
      times_shown INTEGER NOT NULL DEFAULT 0,
      times_correct INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE
    );

    INSERT INTO cards_migrated (
      id, deck_id, source_text, destination_text,
      times_shown, times_correct, status, created_at, updated_at
    )
    SELECT
      id, '${deckId}', dutch, meaning,
      times_shown, times_correct, status, created_at, updated_at
    FROM cards;

    DROP TABLE cards;
    ALTER TABLE cards_migrated RENAME TO cards;
  `);

  await db.runAsync(
    `UPDATE settings SET active_deck_id = ? WHERE id = 1`,
    deckId
  );
}

export { DEFAULT_DISPLAY_LIMIT };
