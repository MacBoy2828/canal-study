import { useCallback, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import * as settingsDb from '@/src/db/settings';
import {
  areStudyRemindersAvailable,
  formatReminderTime,
  syncStudyReminder,
} from '@/src/reminders/studyReminder';

export function useStudyReminder() {
  const db = useSQLiteContext();
  const available = areStudyRemindersAvailable();
  const [enabled, setEnabledState] = useState(false);
  const [hour, setHour] = useState(settingsDb.DEFAULT_REMINDER_HOUR);
  const [minute, setMinute] = useState(settingsDb.DEFAULT_REMINDER_MINUTE);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    const settings = await settingsDb.getSettings(db);
    setEnabledState(settings.reminderEnabled);
    setHour(settings.reminderHour);
    setMinute(settings.reminderMinute);
    if (available) {
      await syncStudyReminder({
        enabled: settings.reminderEnabled,
        hour: settings.reminderHour,
        minute: settings.reminderMinute,
      });
    }
    setLoading(false);
  }, [available, db]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const setEnabled = useCallback(
    async (nextEnabled: boolean) => {
      if (!available) {
        return { ok: false as const, reason: 'unavailable' as const };
      }
      setBusy(true);
      try {
        if (nextEnabled) {
          const scheduled = await syncStudyReminder({
            enabled: true,
            hour,
            minute,
          });
          if (!scheduled) {
            return {
              ok: false as const,
              reason: 'permission' as const,
            };
          }
        } else {
          await syncStudyReminder({ enabled: false, hour, minute });
        }
        await settingsDb.setStudyReminder(db, {
          enabled: nextEnabled,
          hour,
          minute,
        });
        setEnabledState(nextEnabled);
        return { ok: true as const };
      } finally {
        setBusy(false);
      }
    },
    [available, db, hour, minute]
  );

  const setTime = useCallback(
    async (nextHour: number, nextMinute: number) => {
      if (!available) {
        return { ok: false as const, reason: 'unavailable' as const };
      }
      setBusy(true);
      try {
        if (enabled) {
          const scheduled = await syncStudyReminder({
            enabled: true,
            hour: nextHour,
            minute: nextMinute,
          });
          if (!scheduled) {
            return {
              ok: false as const,
              reason: 'permission' as const,
            };
          }
        }
        await settingsDb.setStudyReminder(db, {
          enabled,
          hour: nextHour,
          minute: nextMinute,
        });
        setHour(nextHour);
        setMinute(nextMinute);
        return { ok: true as const };
      } finally {
        setBusy(false);
      }
    },
    [available, db, enabled]
  );

  return {
    available,
    enabled,
    hour,
    minute,
    loading,
    busy,
    timeLabel: formatReminderTime(hour, minute),
    setEnabled,
    setTime,
    refresh,
  };
}
