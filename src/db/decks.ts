import type { SQLiteDatabase } from 'expo-sqlite';

import type { Deck, NewDeck } from './types';

type DeckRow = {
  id: string;
  source_language: string;
  destination_language: string;
  created_at: number;
  updated_at: number;
};

function mapRow(row: DeckRow): Deck {
  return {
    id: row.id,
    sourceLanguage: row.source_language,
    destinationLanguage: row.destination_language,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function createId(): string {
  return `deck_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

export function deckLabel(deck: Deck): string {
  return `${deck.sourceLanguage} → ${deck.destinationLanguage}`;
}

export async function listDecks(db: SQLiteDatabase): Promise<Deck[]> {
  const rows = await db.getAllAsync<DeckRow>(
    `SELECT * FROM decks ORDER BY updated_at DESC`
  );
  return rows.map(mapRow);
}

export async function getDeckById(
  db: SQLiteDatabase,
  id: string
): Promise<Deck | null> {
  const row = await db.getFirstAsync<DeckRow>(
    `SELECT * FROM decks WHERE id = ?`,
    id
  );
  return row ? mapRow(row) : null;
}

export async function createDeck(
  db: SQLiteDatabase,
  input: NewDeck
): Promise<Deck> {
  const now = Date.now();
  const deck: Deck = {
    id: createId(),
    sourceLanguage: input.sourceLanguage.trim(),
    destinationLanguage: input.destinationLanguage.trim(),
    createdAt: now,
    updatedAt: now,
  };

  await db.runAsync(
    `INSERT INTO decks (id, source_language, destination_language, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?)`,
    deck.id,
    deck.sourceLanguage,
    deck.destinationLanguage,
    deck.createdAt,
    deck.updatedAt
  );

  return deck;
}

export async function updateDeck(
  db: SQLiteDatabase,
  id: string,
  input: NewDeck
): Promise<void> {
  await db.runAsync(
    `UPDATE decks
     SET source_language = ?, destination_language = ?, updated_at = ?
     WHERE id = ?`,
    input.sourceLanguage.trim(),
    input.destinationLanguage.trim(),
    Date.now(),
    id
  );
}

export async function deleteDeck(db: SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync(`DELETE FROM cards WHERE deck_id = ?`, id);
  await db.runAsync(`DELETE FROM decks WHERE id = ?`, id);
}
