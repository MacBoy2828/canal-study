import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  type TextInput as TextInputType,
} from 'react-native';

import { BrandHeader } from '@/src/components/BrandHeader';
import { DeckSwitcher } from '@/src/components/DeckSwitcher';
import { EmptyState } from '@/src/components/EmptyState';
import { PressableScale } from '@/src/components/PressableScale';
import { ScreenBackground } from '@/src/components/ScreenBackground';
import { Toast } from '@/src/components/Toast';
import { deckLabel } from '@/src/db/decks';
import { useActiveCards } from '@/src/hooks/useCards';
import { useDecks } from '@/src/hooks/useDecks';
import { colors, fonts, radius, shadows, spacing } from '@/src/theme';

export default function AddScreen() {
  const { decks, activeDeck, select } = useDecks();
  const { create } = useActiveCards();
  const [sourceText, setSourceText] = useState('');
  const [destinationText, setDestinationText] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const sourceRef = useRef<TextInputType>(null);
  const destinationRef = useRef<TextInputType>(null);
  const scrollRef = useRef<ScrollView>(null);

  const hideToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    const show = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardOpen(true)
    );
    const hide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardOpen(false)
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const onSave = async () => {
    if (!activeDeck) {
      setToast('Create a language pair in Settings first');
      return;
    }
    if (!sourceText.trim() || !destinationText.trim()) {
      setToast('Fill in both sides of the card');
      return;
    }
    setSaving(true);
    try {
      const word = sourceText.trim();
      await create({ sourceText, destinationText });
      setSourceText('');
      setDestinationText('');
      setToast(`Added “${word}”`);
      // Keep the keyboard up for rapid entry of the next card.
      requestAnimationFrame(() => {
        sourceRef.current?.focus();
      });
    } finally {
      setSaving(false);
    }
  };

  if (!activeDeck) {
    return (
      <ScreenBackground>
        <BrandHeader subtitle="Add a card" />
        <EmptyState
          image={require('../../assets/images/add-card.png')}
          title="No language pair yet"
          message="Go to Settings and create a source → destination pair before adding cards."
        />
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <BrandHeader subtitle={deckLabel(activeDeck)} />
      <DeckSwitcher
        decks={decks}
        activeDeckId={activeDeck.id}
        onSelect={(id) => void select(id)}
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          automaticallyAdjustKeyboardInsets
        >
          {!keyboardOpen ? (
            <Image
              source={require('../../assets/images/add-card.png')}
              style={styles.illustration}
              resizeMode="cover"
            />
          ) : null}
          <Text style={styles.label}>{activeDeck.sourceLanguage}</Text>
          <TextInput
            ref={sourceRef}
            value={sourceText}
            onChangeText={setSourceText}
            placeholder={`Word in ${activeDeck.sourceLanguage}`}
            placeholderTextColor={colors.tabInactive}
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => destinationRef.current?.focus()}
          />
          <Text style={styles.label}>{activeDeck.destinationLanguage}</Text>
          <TextInput
            ref={destinationRef}
            value={destinationText}
            onChangeText={setDestinationText}
            placeholder={`Word in ${activeDeck.destinationLanguage}`}
            placeholderTextColor={colors.tabInactive}
            style={styles.input}
            autoCapitalize="none"
            returnKeyType="done"
            blurOnSubmit={false}
            onFocus={() => {
              requestAnimationFrame(() => {
                scrollRef.current?.scrollToEnd({ animated: true });
              });
            }}
            onSubmitEditing={() => void onSave()}
          />
          <PressableScale
            onPress={() => void onSave()}
            disabled={saving}
            style={[styles.button, saving && styles.buttonDisabled]}
          >
            <Text style={styles.buttonText}>
              {saving ? 'Saving…' : 'Add card'}
            </Text>
          </PressableScale>
        </ScrollView>
      </KeyboardAvoidingView>
      <Toast message={toast ?? ''} visible={!!toast} onHide={hideToast} />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  form: {
    flexGrow: 1,
    gap: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  illustration: {
    width: '100%',
    height: 168,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    ...shadows.lift,
  },
  label: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.slate,
    marginTop: spacing.sm,
  },
  input: {
    backgroundColor: colors.paper,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.paperEdge,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontFamily: fonts.body,
    fontSize: 18,
    color: colors.ink,
    ...shadows.soft,
  },
  button: {
    marginTop: spacing.lg,
    backgroundColor: colors.orange,
    borderRadius: radius.md,
    paddingVertical: 15,
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
});
