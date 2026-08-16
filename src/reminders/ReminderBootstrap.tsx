import { useEffect } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import { getSettings } from '@/src/db/settings';
import { syncStudyReminder } from '@/src/reminders/studyReminder';

/** Re-fills the rolling reminder schedule whenever the app starts. */
export function ReminderBootstrap() {
  const db = useSQLiteContext();

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const settings = await getSettings(db);
        if (cancelled || !settings.reminderEnabled) return;
        await syncStudyReminder({
          enabled: true,
          hour: settings.reminderHour,
          minute: settings.reminderMinute,
        });
      } catch {
        // Reminder refresh is best-effort on launch.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [db]);

  return null;
}
