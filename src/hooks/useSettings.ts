import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import { getSettings, setDisplayLimit as saveDisplayLimit } from '@/src/db/settings';

/** @deprecated Prefer useDecks for display limit + active deck */
export function useSettings() {
  const db = useSQLiteContext();
  const [displayLimit, setDisplayLimitState] = useState(10);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const settings = await getSettings(db);
      setDisplayLimitState(settings.displayLimit);
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh])
  );

  const setDisplayLimit = useCallback(
    async (value: number) => {
      await saveDisplayLimit(db, value);
      setDisplayLimitState(Math.max(1, Math.min(100, Math.round(value))));
    },
    [db]
  );

  return { displayLimit, setDisplayLimit, loading, refresh };
}
