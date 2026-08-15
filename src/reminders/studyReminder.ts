import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

export const STUDY_REMINDER_ID = 'canal-study-daily-reminder';
export const STUDY_REMINDER_CHANNEL_ID = 'study-reminders';

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

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(STUDY_REMINDER_CHANNEL_ID, {
    name: 'Study reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#E36A2A',
  });
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
  const requested = await Notifications.requestPermissionsAsync();
  return (
    requested.granted ||
    requested.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
}

export async function cancelStudyReminder(): Promise<void> {
  if (Platform.OS === 'web') return;
  await Notifications.cancelScheduledNotificationAsync(STUDY_REMINDER_ID);
}

export async function scheduleStudyReminder(
  hour: number,
  minute: number
): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  const granted = await requestNotificationPermission();
  if (!granted) return false;

  await ensureAndroidChannel();
  await cancelStudyReminder();

  await Notifications.scheduleNotificationAsync({
    identifier: STUDY_REMINDER_ID,
    content: {
      title: 'Time to study',
      body: 'A few minutes with Canal Study keeps your words fresh.',
      sound: true,
      ...(Platform.OS === 'android'
        ? { channelId: STUDY_REMINDER_CHANNEL_ID }
        : {}),
    },
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
