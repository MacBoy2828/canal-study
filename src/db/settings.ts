import type { SQLiteDatabase } from 'expo-sqlite';

import { DEFAULT_DISPLAY_LIMIT } from './schema';
import type { Settings } from './types';

export const DEFAULT_REMINDER_HOUR = 19;
export const DEFAULT_REMINDER_MINUTE = 0;

type SettingsRow = {
  display_limit: number;
  active_deck_id: string | null;
  reminder_enabled: number | null;
  reminder_hour: number | null;
  reminder_minute: number | null;
};

function clampHour(hour: number): number {
  return Math.max(0, Math.min(23, Math.round(hour)));
}

function clampMinute(minute: number): number {
  return Math.max(0, Math.min(59, Math.round(minute)));
}

export async function getSettings(db: SQLiteDatabase): Promise<Settings> {
  const row = await db.getFirstAsync<SettingsRow>(
    `SELECT display_limit, active_deck_id, reminder_enabled, reminder_hour, reminder_minute
     FROM settings WHERE id = 1`
  );
  return {
    displayLimit: row?.display_limit ?? DEFAULT_DISPLAY_LIMIT,
    activeDeckId: row?.active_deck_id ?? null,
    reminderEnabled: (row?.reminder_enabled ?? 0) === 1,
    reminderHour: clampHour(row?.reminder_hour ?? DEFAULT_REMINDER_HOUR),
    reminderMinute: clampMinute(row?.reminder_minute ?? DEFAULT_REMINDER_MINUTE),
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

export async function setStudyReminder(
  db: SQLiteDatabase,
  options: {
    enabled: boolean;
    hour: number;
    minute: number;
  }
): Promise<Settings> {
  const hour = clampHour(options.hour);
  const minute = clampMinute(options.minute);
  await db.runAsync(
    `UPDATE settings
     SET reminder_enabled = ?, reminder_hour = ?, reminder_minute = ?
     WHERE id = 1`,
    options.enabled ? 1 : 0,
    hour,
    minute
  );
  return getSettings(db);
}
