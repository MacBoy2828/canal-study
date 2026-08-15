import type { SQLiteDatabase } from 'expo-sqlite';

import { DEFAULT_DISPLAY_LIMIT } from './schema';
import type { Settings } from './types';

type SettingsRow = {
  display_limit: number;
  active_deck_id: string | null;
};

export async function getSettings(db: SQLiteDatabase): Promise<Settings> {
  const row = await db.getFirstAsync<SettingsRow>(
    `SELECT display_limit, active_deck_id FROM settings WHERE id = 1`
  );
  return {
    displayLimit: row?.display_limit ?? DEFAULT_DISPLAY_LIMIT,
    activeDeckId: row?.active_deck_id ?? null,
  };
}

export async function setDisplayLimit(
  db: SQLiteDatabase,
  displayLimit: number
): Promise<void> {
  const clamped = Math.max(1, Math.min(100, Math.round(displayLimit)));
  await db.runAsync(
    `UPDATE settings SET display_limit = ? WHERE id = 1`,
    clamped
  );
}

export async function setActiveDeckId(
  db: SQLiteDatabase,
  deckId: string | null
): Promise<void> {
  await db.runAsync(
    `UPDATE settings SET active_deck_id = ? WHERE id = 1`,
    deckId
  );
}
