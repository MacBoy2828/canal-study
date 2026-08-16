import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Notifications from 'expo-notifications';

export const STUDY_REMINDER_ID = 'canal-study-daily-reminder';
export const STUDY_REMINDER_CHANNEL_ID = 'study-reminders';
const ROLLING_DAYS = 14;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function formatReminderTime(hour: number, minute: number): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function nextOccurrences(hour: number, minute: number, count: number): Date[] {
  const dates: Date[] = [];
  const now = new Date();
  const cursor = new Date();
  cursor.setSeconds(0, 0);
  cursor.setHours(hour, minute, 0, 0);
  if (cursor.getTime() <= now.getTime() + 15_000) {
    cursor.setDate(cursor.getDate() + 1);
  }
  for (let i = 0; i < count; i += 1) {
    const date = new Date(cursor);
    date.setDate(cursor.getDate() + i);
    dates.push(date);
  }
  return dates;
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(STUDY_REMINDER_CHANNEL_ID, {
    name: 'Study reminders',
    description: 'Daily reminders to keep studying',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#E36A2A',
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    bypassDnd: false,
  });
}

export async function openExactAlarmSettings(): Promise<void> {
  if (Platform.OS !== 'android' || Platform.Version < 31) return;
  const pkg =
    Constants.expoConfig?.android?.package ??
    Constants.easConfig?.projectId ??
    'com.canalstudy.app';
  try {
    await IntentLauncher.startActivityAsync(
      'android.settings.REQUEST_SCHEDULE_EXACT_ALARM',
      { data: `package:${pkg}` }
    );
  } catch {
    try {
      await IntentLauncher.startActivityAsync(
        IntentLauncher.ActivityAction.APPLICATION_DETAILS_SETTINGS,
        { data: `package:${pkg}` }
      );
    } catch {
      // User can still enable alarms manually in system settings.
    }
  }
}

export async function getNotificationPermissionGranted(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const settings = await Notifications.getPermissionsAsync();
  return (
    settings.granted ||
    settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  await ensureAndroidChannel();
  const existing = await Notifications.getPermissionsAsync();
  if (
    existing.granted ||
    existing.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  ) {
    return true;
  }
  const requested = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: false,
      allowSound: true,
    },
  });
  return (
    requested.granted ||
    requested.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
}

async function cancelAllReminderNotifications(): Promise<void> {
  if (Platform.OS === 'web') return;
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter(
        (item) =>
          item.identifier === STUDY_REMINDER_ID ||
          item.identifier.startsWith(`${STUDY_REMINDER_ID}-`)
      )
      .map((item) =>
        Notifications.cancelScheduledNotificationAsync(item.identifier)
      )
  );
}

export async function cancelStudyReminder(): Promise<void> {
  await cancelAllReminderNotifications();
}

export async function scheduleStudyReminder(
  hour: number,
  minute: number
): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  const granted = await requestNotificationPermission();
  if (!granted) return false;

  await ensureAndroidChannel();
  await cancelAllReminderNotifications();

  const content = {
    title: 'Time to study',
    body: 'A few minutes with Canal Study keeps your words fresh.',
    sound: true as const,
    ...(Platform.OS === 'android'
      ? { channelId: STUDY_REMINDER_CHANNEL_ID }
      : {}),
  };

  // Rolling exact DATE triggers are more reliable on Android than a single
  // DAILY trigger when the OS delays inexact alarms until the next wake.
  const dates = nextOccurrences(hour, minute, ROLLING_DAYS);
  await Promise.all(
    dates.map((date, index) =>
      Notifications.scheduleNotificationAsync({
        identifier: `${STUDY_REMINDER_ID}-${index}`,
        content,
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date,
          ...(Platform.OS === 'android'
            ? { channelId: STUDY_REMINDER_CHANNEL_ID }
            : {}),
        },
      })
    )
  );

  // Keep a DAILY backup for platforms that honor it well (especially iOS).
  await Notifications.scheduleNotificationAsync({
    identifier: STUDY_REMINDER_ID,
    content,
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      ...(Platform.OS === 'android'
        ? { channelId: STUDY_REMINDER_CHANNEL_ID }
        : {}),
    },
  });

  return true;
}

export async function syncStudyReminder(options: {
  enabled: boolean;
  hour: number;
  minute: number;
}): Promise<boolean> {
  if (!options.enabled) {
    await cancelStudyReminder();
    return true;
  }
  return scheduleStudyReminder(options.hour, options.minute);
}
