import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import * as cardsDb from '@/src/db/cards';
import type { Deck, Flashcard, StudyMode } from '@/src/db/types';
import { useDecks } from '@/src/hooks/useDecks';

export type StudyPrompt = {
  card: Flashcard;
  mode: StudyMode;
  prompt: string;
  answer: string;
  promptLabel: string;
  answerLabel: string;
};

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function buildPrompt(
  card: Flashcard,
  mode: StudyMode,
  deck: Deck
): StudyPrompt {
  if (mode === 'source-to-dest') {
    return {
      card,
      mode,
      prompt: card.sourceText,
      answer: card.destinationText,
      promptLabel: deck.sourceLanguage,
      answerLabel: deck.destinationLanguage,
    };
  }
  return {
    card,
    mode,
    prompt: card.destinationText,
    answer: card.sourceText,
    promptLabel: deck.destinationLanguage,
    answerLabel: deck.sourceLanguage,
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
    setCurrent(buildPrompt(card, mode, deck));
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
    refresh,
  };
}
