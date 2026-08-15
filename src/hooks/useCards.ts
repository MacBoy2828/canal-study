import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import * as cardsDb from '@/src/db/cards';
import type { Flashcard, NewFlashcard } from '@/src/db/types';
import { useDecks } from '@/src/hooks/useDecks';

export function useCards(status: 'active' | 'archived') {
  const db = useSQLiteContext();
  const { activeDeck } = useDecks();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      if (!activeDeck) {
        setCards([]);
        return;
      }
      const rows = await cardsDb.listCards(db, activeDeck.id, status);
      setCards(rows);
    } finally {
      setLoading(false);
    }
  }, [activeDeck, db, status]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh])
  );

  // Re-load when the active deck changes while this screen stays mounted
  useEffect(() => {
    void refresh();
  }, [activeDeck?.id]);

  const create = useCallback(
    async (input: NewFlashcard) => {
      if (!activeDeck) {
        throw new Error('No active language pair');
      }
      const card = await cardsDb.createCard(db, activeDeck.id, input);
      await refresh();
      return card;
    },
    [activeDeck, db, refresh]
  );

  const update = useCallback(
    async (id: string, input: NewFlashcard) => {
      await cardsDb.updateCard(db, id, input);
      await refresh();
    },
    [db, refresh]
  );

  const remove = useCallback(
    async (id: string) => {
      await cardsDb.deleteCard(db, id);
      await refresh();
    },
    [db, refresh]
  );

  const restore = useCallback(
    async (id: string) => {
      await cardsDb.restoreCard(db, id);
      await refresh();
    },
    [db, refresh]
  );

  return {
    cards,
    loading,
    activeDeck,
    refresh,
    create,
    update,
    remove,
    restore,
  };
}

export function useActiveCards() {
  return useCards('active');
}

export function useArchivedCards() {
  return useCards('archived');
}
