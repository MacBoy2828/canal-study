import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import * as Application from 'expo-application';
import Constants from 'expo-constants';

import { BrandHeader } from '@/src/components/BrandHeader';
import { PressableScale } from '@/src/components/PressableScale';
import { ScreenBackground } from '@/src/components/ScreenBackground';
import { Surface } from '@/src/components/Surface';
import { Toast } from '@/src/components/Toast';
import { deckLabel } from '@/src/db/decks';
import { useDecks } from '@/src/hooks/useDecks';
import { useStudyReminder } from '@/src/hooks/useStudyReminder';
import { openExactAlarmSettings } from '@/src/reminders/studyReminder';
import { colors, fonts, radius, shadows, spacing } from '@/src/theme';
import { useUpdate } from '@/src/updates/UpdateProvider';

const GITHUB_REPO_URL = 'https://github.com/MacBoy2828/canal-study';

export default function SettingsScreen() {
  const {
    decks,
    activeDeck,
    displayLimit,
    create,
    remove,
    select,
    setDisplayLimit,
  } = useDecks();
  const { checkForUpdate, localVersion, status } = useUpdate();
  const reminder = useStudyReminder();
  const [limitValue, setLimitValue] = useState(String(displayLimit));
  const [sourceLanguage, setSourceLanguage] = useState('');
  const [destinationLanguage, setDestinationLanguage] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [limitSaved, setLimitSaved] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [draftTime, setDraftTime] = useState<Date | null>(null);

  const buildNumber =
    Application.nativeBuildVersion ??
    String(Constants.expoConfig?.android?.versionCode ?? '');

  useEffect(() => {
    setLimitValue(String(displayLimit));
  }, [displayLimit]);

  const onSaveLimit = async () => {
    const parsed = Number(limitValue);
    if (!Number.isFinite(parsed)) return;
    await setDisplayLimit(parsed);
    setLimitSaved(true);
    setTimeout(() => setLimitSaved(false), 1600);
  };

  const onCreateDeck = async () => {
    if (!sourceLanguage.trim() || !destinationLanguage.trim()) {
      setToast('Enter both source and destination languages');
      return;
    }
    const deck = await create({ sourceLanguage, destinationLanguage });
    setSourceLanguage('');
    setDestinationLanguage('');
    setToast(`Created ${deckLabel(deck)}`);
  };

  const confirmDelete = (id: string, label: string) => {
    Alert.alert(
      'Delete language pair?',
      `"${label}" and all of its cards will be removed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => void remove(id),
        },
      ]
    );
  };

  const openGitHub = () => {
    void Linking.openURL(GITHUB_REPO_URL);
  };

  const showPermissionHelp = () => {
    Alert.alert(
      'Notifications needed',
      'Allow notifications for Canal Study in system settings to get daily study reminders.',
      [
        { text: 'Not now', style: 'cancel' },
        {
          text: 'Open settings',
          onPress: () => void Linking.openSettings(),
        },
      ]
    );
  };

  const onToggleReminder = async (next: boolean) => {
    const result = await reminder.setEnabled(next);
    if (!result.ok && result.reason === 'permission') {
      showPermissionHelp();
      return;
    }
    if (next && Platform.OS === 'android' && Platform.Version >= 31) {
      Alert.alert(
        'Allow exact alarms',
        'Android may delay reminders until you open the app unless Canal Study can use exact alarms. Allow alarms & reminders for this app.',
        [
          { text: 'Later', style: 'cancel' },
          {
            text: 'Open alarm settings',
            onPress: () => void openExactAlarmSettings(),
          },
        ]
      );
    }
    setToast(
      next
        ? `Daily reminder set for ${reminder.timeLabel}`
        : 'Daily reminder turned off'
    );
  };

  const onReminderTimeChange = (
    event: DateTimePickerEvent,
    date?: Date
  ) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
      if (event.type !== 'set' || !date) return;
      void applyReminderTime(date);
      return;
    }
    if (date) setDraftTime(date);
  };

  const applyReminderTime = async (date: Date) => {
    const result = await reminder.setTime(date.getHours(), date.getMinutes());
    if (!result.ok && result.reason === 'permission') {
      showPermissionHelp();
      return;
    }
    const label = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    setToast(`Reminder time set to ${label}`);
  };

  const openTimePicker = () => {
    const date = new Date();
    date.setHours(reminder.hour, reminder.minute, 0, 0);
    setDraftTime(date);
    setShowTimePicker(true);
  };

  const confirmIosTime = async () => {
    setShowTimePicker(false);
    if (draftTime) {
      await applyReminderTime(draftTime);
    }
  };

  const reminderPickerDate =
    draftTime ??
    (() => {
      const date = new Date();
      date.setHours(reminder.hour, reminder.minute, 0, 0);
      return date;
    })();

  const checking = status === 'checking' || status === 'downloading';

  return (
    <ScreenBackground>
      <BrandHeader subtitle="Languages & preferences" />
      <FlatList
        data={decks}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <Surface delay={40}>
              <Text style={styles.title}>About</Text>
              <Text style={styles.versionLine}>
                Canal Study {localVersion}
                {buildNumber ? ` · build ${buildNumber}` : ''}
              </Text>
              <Text style={styles.copy}>
                Open-source flashcards for any language pair. Source code and
                releases are on GitHub.
              </Text>
              <PressableScale onPress={openGitHub} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>
                  github.com/MacBoy2828/canal-study
                </Text>
              </PressableScale>
              <PressableScale
                onPress={() => void checkForUpdate({ interactive: true })}
                disabled={checking}
                style={[styles.button, checking && styles.buttonDisabled]}
              >
                <Text style={styles.buttonText}>
                  {status === 'checking'
                    ? 'Checking…'
                    : status === 'downloading'
                      ? 'Downloading…'
                      : 'Check for updates'}
                </Text>
              </PressableScale>
            </Surface>

            <Surface delay={100}>
              <Text style={styles.title}>New language pair</Text>
              <Text style={styles.copy}>
                Source is what you are learning. Destination is how you
                translate or define it. Study mixes both directions.
              </Text>
              <Text style={styles.label}>Source language</Text>
              <TextInput
                value={sourceLanguage}
                onChangeText={setSourceLanguage}
                placeholder="e.g. Spanish"
                placeholderTextColor={colors.tabInactive}
                style={styles.input}
                autoCapitalize="words"
              />
              <Text style={styles.label}>Destination language</Text>
              <TextInput
                value={destinationLanguage}
                onChangeText={setDestinationLanguage}
                placeholder="e.g. English"
                placeholderTextColor={colors.tabInactive}
                style={styles.input}
                autoCapitalize="words"
              />
              <PressableScale
                onPress={() => void onCreateDeck()}
                style={styles.button}
              >
                <Text style={styles.buttonText}>Add language pair</Text>
              </PressableScale>
            </Surface>

            <Surface delay={160}>
              <Text style={styles.title}>Display limit</Text>
              <Text style={styles.copy}>
                After a card is shown this many times in the active pair, it
                moves to the archive. Raising the limit brings archived cards
                back if they are still under it; lowering archives cards that
                already meet the new limit.
              </Text>
              <TextInput
                value={limitValue}
                onChangeText={setLimitValue}
                keyboardType="number-pad"
                style={styles.input}
              />
              <PressableScale
                onPress={() => void onSaveLimit()}
                style={styles.button}
              >
                <Text style={styles.buttonText}>
                  {limitSaved ? 'Saved' : 'Save limit'}
                </Text>
              </PressableScale>
            </Surface>

            {Platform.OS !== 'web' ? (
              <Surface delay={220}>
                <Text style={styles.title}>Daily reminder</Text>
                <Text style={styles.copy}>
                  Get a local notification each day at the time you choose,
                  even when the app is closed. On newer Android phones, allow
                  Alarms & reminders for Canal Study so it is not delayed.
                </Text>
                <View style={styles.reminderRow}>
                  <Text style={styles.reminderLabel}>Remind me to study</Text>
                  <Switch
                    value={reminder.enabled}
                    onValueChange={(value) => void onToggleReminder(value)}
                    disabled={reminder.loading || reminder.busy}
                    trackColor={{
                      false: colors.mistDeep,
                      true: colors.orangeSoft,
                    }}
                    thumbColor={
                      reminder.enabled ? colors.orange : colors.white
                    }
                  />
                </View>
                <PressableScale
                  onPress={openTimePicker}
                  disabled={reminder.loading || reminder.busy}
                  style={styles.secondaryButton}
                >
                  <Text style={styles.secondaryButtonText}>
                    Reminder time · {reminder.timeLabel}
                  </Text>
                </PressableScale>
                {showTimePicker ? (
                  <DateTimePicker
                    value={reminderPickerDate}
                    mode="time"
                    is24Hour
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onReminderTimeChange}
                  />
                ) : null}
                {Platform.OS === 'ios' && showTimePicker ? (
                  <PressableScale
                    onPress={() => void confirmIosTime()}
                    style={styles.button}
                  >
                    <Text style={styles.buttonText}>Done</Text>
                  </PressableScale>
                ) : null}
              </Surface>
            ) : null}

            <Text style={styles.sectionTitle}>Your language pairs</Text>
            {decks.length === 0 ? (
              <Text style={styles.emptyPairs}>
                No pairs yet. Create one above to start adding cards.
              </Text>
            ) : null}
          </View>
        }
        renderItem={({ item }) => {
          const active = item.id === activeDeck?.id;
          return (
            <View style={[styles.pairRow, active && styles.pairRowActive]}>
              <Pressable
                style={styles.pairMain}
                onPress={() => void select(item.id)}
              >
                <Text style={styles.pairLabel}>{deckLabel(item)}</Text>
                <Text style={styles.pairMeta}>
                  {active ? 'Active' : 'Tap to switch'}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => confirmDelete(item.id, deckLabel(item))}
                style={styles.delete}
              >
                <Text style={styles.deleteText}>Delete</Text>
              </Pressable>
            </View>
          );
        }}
        ListFooterComponent={
          <Text style={styles.about}>
            Canal Study stores everything on this device. Cards belong to a
            language pair, and study prompts go both ways.
          </Text>
        }
        contentContainerStyle={styles.list}
      />
      <Toast
        message={toast ?? ''}
        visible={!!toast}
        onHide={() => setToast(null)}
      />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
  },
  headerBlock: {
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 24,
    letterSpacing: -0.3,
    color: colors.ink,
  },
  versionLine: {
    fontFamily: fonts.bodySemi,
    fontSize: 17,
    color: colors.orange,
  },
  copy: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 22,
    color: colors.slate,
    marginBottom: spacing.sm,
  },
  label: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.slate,
    marginTop: spacing.xs,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.paperEdge,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontFamily: fonts.body,
    fontSize: 17,
    color: colors.ink,
  },
  button: {
    marginTop: spacing.sm,
    backgroundColor: colors.orange,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    ...shadows.soft,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontFamily: fonts.bodySemi,
    fontSize: 17,
    color: colors.white,
  },
  secondaryButton: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.paperEdge,
    backgroundColor: colors.mistSoft,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.ink,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  reminderLabel: {
    flex: 1,
    fontFamily: fonts.bodySemi,
    fontSize: 16,
    color: colors.ink,
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: 22,
    letterSpacing: -0.2,
    color: colors.ink,
    marginTop: spacing.sm,
  },
  emptyPairs: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.slate,
  },
  pairRow: {
    backgroundColor: colors.paper,
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.paperEdge,
    ...shadows.soft,
  },
  pairRowActive: {
    borderColor: colors.orange,
    backgroundColor: colors.white,
  },
  pairMain: {
    flex: 1,
    gap: 2,
  },
  pairLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 17,
    color: colors.ink,
  },
  pairMeta: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.tabInactive,
  },
  delete: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  deleteText: {
    fontFamily: fonts.bodySemi,
    color: colors.wrong,
    fontSize: 14,
  },
  about: {
    marginTop: spacing.xl,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.slate,
    textAlign: 'center',
    lineHeight: 20,
  },
});
