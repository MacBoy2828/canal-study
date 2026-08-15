import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Application from 'expo-application';
import Constants from 'expo-constants';

import { BrandHeader } from '@/src/components/BrandHeader';
import { ScreenBackground } from '@/src/components/ScreenBackground';
import { Toast } from '@/src/components/Toast';
import { deckLabel } from '@/src/db/decks';
import { useDecks } from '@/src/hooks/useDecks';
import { colors, fonts, radius, spacing } from '@/src/theme';
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
  const [limitValue, setLimitValue] = useState(String(displayLimit));
  const [sourceLanguage, setSourceLanguage] = useState('');
  const [destinationLanguage, setDestinationLanguage] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [limitSaved, setLimitSaved] = useState(false);

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

  const checking = status === 'checking' || status === 'downloading';

  return (
    <ScreenBackground>
      <BrandHeader subtitle="Languages & preferences" />
      <FlatList
        data={decks}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <View style={styles.card}>
              <Text style={styles.title}>About</Text>
              <Text style={styles.versionLine}>
                Canal Study {localVersion}
                {buildNumber ? ` · build ${buildNumber}` : ''}
              </Text>
              <Text style={styles.copy}>
                Open-source flashcards for any language pair. Source code and
                releases are on GitHub.
              </Text>
              <Pressable onPress={openGitHub} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>
                  github.com/MacBoy2828/canal-study
                </Text>
              </Pressable>
              <Pressable
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
              </Pressable>
            </View>

            <View style={styles.card}>
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
              <Pressable onPress={() => void onCreateDeck()} style={styles.button}>
                <Text style={styles.buttonText}>Add language pair</Text>
              </Pressable>
            </View>

            <View style={styles.card}>
              <Text style={styles.title}>Display limit</Text>
              <Text style={styles.copy}>
                After a card is shown this many times in the active pair, it
                moves to the archive.
              </Text>
              <TextInput
                value={limitValue}
                onChangeText={setLimitValue}
                keyboardType="number-pad"
                style={styles.input}
              />
              <Pressable onPress={() => void onSaveLimit()} style={styles.button}>
                <Text style={styles.buttonText}>
                  {limitSaved ? 'Saved' : 'Save limit'}
                </Text>
              </Pressable>
            </View>

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
              <Pressable style={styles.pairMain} onPress={() => void select(item.id)}>
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
  card: {
    backgroundColor: colors.paper,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 24,
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
    borderColor: colors.paperWarm,
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
    borderColor: colors.mistDeep,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.ink,
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: 22,
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
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.paperWarm,
  },
  pairRowActive: {
    borderColor: colors.orange,
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
