import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import * as cardsDb from '@/src/db/cards';
import * as decksDb from '@/src/db/decks';
import {
  getSettings,
  setActiveDeckId,
  setDisplayLimit as saveDisplayLimit,
} from '@/src/db/settings';
import type { Deck, NewDeck } from '@/src/db/types';

type DecksContextValue = {
  decks: Deck[];
  activeDeck: Deck | null;
  displayLimit: number;
  loading: boolean;
  refresh: () => Promise<void>;
  create: (input: NewDeck) => Promise<Deck>;
  update: (id: string, input: NewDeck) => Promise<void>;
  remove: (id: string) => Promise<void>;
  select: (id: string) => Promise<void>;
  setDisplayLimit: (value: number) => Promise<void>;
};

const DecksContext = createContext<DecksContextValue | null>(null);

export function DecksProvider({ children }: { children: ReactNode }) {
  const db = useSQLiteContext();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [activeDeck, setActiveDeck] = useState<Deck | null>(null);
  const [displayLimit, setDisplayLimitState] = useState(10);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [allDecks, settings] = await Promise.all([
        decksDb.listDecks(db),
        getSettings(db),
      ]);
      setDecks(allDecks);
      setDisplayLimitState(settings.displayLimit);

      let current: Deck | null = null;
      if (settings.activeDeckId) {
        current =
          allDecks.find((d) => d.id === settings.activeDeckId) ?? null;
      }
      if (!current && allDecks.length > 0) {
        current = allDecks[0];
      }

      if (current && settings.activeDeckId !== current.id) {
        await setActiveDeckId(db, current.id);
      }
      if (!current && settings.activeDeckId) {
        await setActiveDeckId(db, null);
      }

      setActiveDeck(current);
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const create = useCallback(
    async (input: NewDeck) => {
      const deck = await decksDb.createDeck(db, input);
      await setActiveDeckId(db, deck.id);
      await refresh();
      return deck;
    },
    [db, refresh]
  );

  const update = useCallback(
    async (id: string, input: NewDeck) => {
      await decksDb.updateDeck(db, id, input);
      await refresh();
    },
    [db, refresh]
  );

  const remove = useCallback(
    async (id: string) => {
      await decksDb.deleteDeck(db, id);
      const settings = await getSettings(db);
      if (settings.activeDeckId === id) {
        const remaining = await decksDb.listDecks(db);
        await setActiveDeckId(db, remaining[0]?.id ?? null);
      }
      await refresh();
    },
    [db, refresh]
  );

  const select = useCallback(
    async (id: string) => {
      await setActiveDeckId(db, id);
      await refresh();
    },
    [db, refresh]
  );

  const setDisplayLimit = useCallback(
    async (value: number) => {
      const clamped = Math.max(1, Math.min(100, Math.round(value)));
      await saveDisplayLimit(db, clamped);
      await cardsDb.reconcileStatusesForDisplayLimit(db, clamped);
      setDisplayLimitState(clamped);
    },
    [db]
  );

  const value = useMemo(
    () => ({
      decks,
      activeDeck,
      displayLimit,
      loading,
      refresh,
      create,
      update,
      remove,
      select,
      setDisplayLimit,
    }),
    [
      decks,
      activeDeck,
      displayLimit,
      loading,
      refresh,
      create,
      update,
      remove,
      select,
      setDisplayLimit,
    ]
  );

  return (
    <DecksContext.Provider value={value}>{children}</DecksContext.Provider>
  );
}

export function useDecks(): DecksContextValue {
  const value = useContext(DecksContext);
  if (!value) {
    throw new Error('useDecks must be used within DecksProvider');
  }
  return value;
}
