import type { SQLiteDatabase } from 'expo-sqlite';

import type { Flashcard, NewFlashcard } from './types';

type CardRow = {
  id: string;
  deck_id: string;
  source_text: string;
  destination_text: string;
  times_shown: number;
  times_correct: number;
  status: 'active' | 'archived';
  created_at: number;
  updated_at: number;
};

function mapRow(row: CardRow): Flashcard {
  return {
    id: row.id,
    deckId: row.deck_id,
    sourceText: row.source_text,
    destinationText: row.destination_text,
    timesShown: row.times_shown,
    timesCorrect: row.times_correct,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function createId(): string {
  return `card_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

export async function listCards(
  db: SQLiteDatabase,
  deckId: string,
  status: 'active' | 'archived'
): Promise<Flashcard[]> {
  const rows = await db.getAllAsync<CardRow>(
    `SELECT * FROM cards WHERE deck_id = ? AND status = ? ORDER BY updated_at DESC`,
    deckId,
    status
  );
  return rows.map(mapRow);
}

export async function getCardById(
  db: SQLiteDatabase,
  id: string
): Promise<Flashcard | null> {
  const row = await db.getFirstAsync<CardRow>(
    `SELECT * FROM cards WHERE id = ?`,
    id
  );
  return row ? mapRow(row) : null;
}

export async function createCard(
  db: SQLiteDatabase,
  deckId: string,
  input: NewFlashcard
): Promise<Flashcard> {
  const now = Date.now();
  const card: Flashcard = {
    id: createId(),
    deckId,
    sourceText: input.sourceText.trim(),
    destinationText: input.destinationText.trim(),
    timesShown: 0,
    timesCorrect: 0,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };

  await db.runAsync(
    `INSERT INTO cards (
      id, deck_id, source_text, destination_text,
      times_shown, times_correct, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    card.id,
    card.deckId,
    card.sourceText,
    card.destinationText,
    card.timesShown,
    card.timesCorrect,
    card.status,
    card.createdAt,
    card.updatedAt
  );

  await db.runAsync(
    `UPDATE decks SET updated_at = ? WHERE id = ?`,
    now,
    deckId
  );

  return card;
}

export async function updateCard(
  db: SQLiteDatabase,
  id: string,
  input: NewFlashcard
): Promise<void> {
  await db.runAsync(
    `UPDATE cards
     SET source_text = ?, destination_text = ?, updated_at = ?
     WHERE id = ?`,
    input.sourceText.trim(),
    input.destinationText.trim(),
    Date.now(),
    id
  );
}

export async function deleteCard(db: SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync(`DELETE FROM cards WHERE id = ?`, id);
}

export async function gradeCard(
  db: SQLiteDatabase,
  id: string,
  correct: boolean,
  displayLimit: number
): Promise<Flashcard | null> {
  const existing = await getCardById(db, id);
  if (!existing) return null;

  const timesShown = existing.timesShown + 1;
  const timesCorrect = existing.timesCorrect + (correct ? 1 : 0);
  const status = timesShown >= displayLimit ? 'archived' : existing.status;
  const updatedAt = Date.now();

  await db.runAsync(
    `UPDATE cards
     SET times_shown = ?, times_correct = ?, status = ?, updated_at = ?
     WHERE id = ?`,
    timesShown,
    timesCorrect,
    status,
    updatedAt,
    id
  );

  return {
    ...existing,
    timesShown,
    timesCorrect,
    status,
    updatedAt,
  };
}

export async function restoreCard(
  db: SQLiteDatabase,
  id: string
): Promise<void> {
  await db.runAsync(
    `UPDATE cards
     SET status = 'active', times_shown = 0, times_correct = 0, updated_at = ?
     WHERE id = ?`,
    Date.now(),
    id
  );
}

/**
 * Keep study/archive pools in sync with the display limit:
 * - archived cards with fewer shows than the new limit return to study
 * - active cards that already meet/exceed the new limit move to archive
 */
export async function reconcileStatusesForDisplayLimit(
  db: SQLiteDatabase,
  displayLimit: number
): Promise<void> {
  const clamped = Math.max(1, Math.min(100, Math.round(displayLimit)));
  const now = Date.now();
  await db.runAsync(
    `UPDATE cards
     SET status = 'active', updated_at = ?
     WHERE status = 'archived' AND times_shown < ?`,
    now,
    clamped
  );
  await db.runAsync(
    `UPDATE cards
     SET status = 'archived', updated_at = ?
     WHERE status = 'active' AND times_shown >= ?`,
    now,
    clamped
  );
}
