import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import * as cardsDb from '@/src/db/cards';
import type { Deck, Flashcard, StudyMode } from '@/src/db/types';
import { useDecks } from '@/src/hooks/useDecks';

export type StudyFormat = 'flashcard' | 'choice';

export type StudyPrompt = {
  card: Flashcard;
  mode: StudyMode;
  format: StudyFormat;
  prompt: string;
  answer: string;
  promptLabel: string;
  answerLabel: string;
  /** Shuffled options for multiple-choice prompts. */
  options?: string[];
};

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function uniqueAnswers(values: string[], correct: string): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const trimmed = value.trim();
    if (!trimmed) continue;
    const key = trimmed.toLocaleLowerCase();
    if (key === correct.trim().toLocaleLowerCase()) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(trimmed);
  }
  return result;
}

function buildPrompt(
  card: Flashcard,
  mode: StudyMode,
  deck: Deck,
  pool: Flashcard[]
): StudyPrompt {
  const base =
    mode === 'source-to-dest'
      ? {
          prompt: card.sourceText,
          answer: card.destinationText,
          promptLabel: deck.sourceLanguage,
          answerLabel: deck.destinationLanguage,
        }
      : {
          prompt: card.destinationText,
          answer: card.sourceText,
          promptLabel: deck.destinationLanguage,
          answerLabel: deck.sourceLanguage,
        };

  const wantChoice = Math.random() < 0.25;
  const distractorPool = uniqueAnswers(
    pool.map((item) =>
      mode === 'source-to-dest' ? item.destinationText : item.sourceText
    ),
    base.answer
  );

  if (wantChoice && distractorPool.length >= 3) {
    const distractors = shuffle(distractorPool).slice(0, 3);
    return {
      card,
      mode,
      format: 'choice',
      ...base,
      options: shuffle([base.answer, ...distractors]),
    };
  }

  return {
    card,
    mode,
    format: 'flashcard',
    ...base,
  };
}

export function useStudySession() {
  const db = useSQLiteContext();
  const { activeDeck, displayLimit, select, decks } = useDecks();
  const [pool, setPool] = useState<Flashcard[]>([]);
  const [current, setCurrent] = useState<StudyPrompt | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(true);

  const drawNext = useCallback((cards: Flashcard[], deck: Deck | null) => {
    if (!deck || cards.length === 0) {
      setCurrent(null);
      setRevealed(false);
      return;
    }
    const card = pickRandom(cards);
    const mode: StudyMode =
      Math.random() < 0.5 ? 'source-to-dest' : 'dest-to-source';
    setCurrent(buildPrompt(card, mode, deck, cards));
    setRevealed(false);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      if (!activeDeck) {
        setPool([]);
        setCurrent(null);
        return;
      }

      const cards = await cardsDb.listCards(db, activeDeck.id, 'active');
      setPool(cards);
      drawNext(cards, activeDeck);
    } finally {
      setLoading(false);
    }
  }, [activeDeck, db, drawNext]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh])
  );

  useEffect(() => {
    void refresh();
  }, [activeDeck?.id, refresh]);

  const reveal = useCallback(() => {
    setRevealed(true);
  }, []);

  const grade = useCallback(
    async (correct: boolean) => {
      if (!current || !activeDeck) return;
      await cardsDb.gradeCard(db, current.card.id, correct, displayLimit);
      const cards = await cardsDb.listCards(db, activeDeck.id, 'active');
      setPool(cards);
      drawNext(cards, activeDeck);
    },
    [activeDeck, current, db, displayLimit, drawNext]
  );

  const answerChoice = useCallback(
    async (option: string) => {
      if (!current || current.format !== 'choice') return;
      const correct =
        option.trim().toLocaleLowerCase() ===
        current.answer.trim().toLocaleLowerCase();
      await grade(correct);
    },
    [current, grade]
  );

  const progressLabel = useMemo(() => {
    if (!current) return '';
    return `${current.card.timesShown} / ${displayLimit}`;
  }, [current, displayLimit]);

  return {
    current,
    revealed,
    loading,
    poolSize: pool.length,
    displayLimit,
    progressLabel,
    activeDeck,
    decks,
    select,
    reveal,
    grade,
    answerChoice,
    refresh,
  };
}
