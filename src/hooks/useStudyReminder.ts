import { useCallback, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import * as settingsDb from '@/src/db/settings';
import {
  formatReminderTime,
  syncStudyReminder,
} from '@/src/reminders/studyReminder';

export function useStudyReminder() {
  const db = useSQLiteContext();
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
    await syncStudyReminder({
      enabled: settings.reminderEnabled,
      hour: settings.reminderHour,
      minute: settings.reminderMinute,
    });
    setLoading(false);
  }, [db]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const setEnabled = useCallback(
    async (nextEnabled: boolean) => {
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
    [db, hour, minute]
  );

  const setTime = useCallback(
    async (nextHour: number, nextMinute: number) => {
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
    [db, enabled]
  );

  return {
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
