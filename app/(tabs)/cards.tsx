import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandHeader } from '@/src/components/BrandHeader';
import { DeckSwitcher } from '@/src/components/DeckSwitcher';
import { EmptyState } from '@/src/components/EmptyState';
import { ScreenBackground } from '@/src/components/ScreenBackground';
import { deckLabel } from '@/src/db/decks';
import type { Flashcard } from '@/src/db/types';
import { useActiveCards } from '@/src/hooks/useCards';
import { useDecks } from '@/src/hooks/useDecks';
import { colors, fonts, motion, radius, shadows, spacing } from '@/src/theme';

export default function CardsScreen() {
  const insets = useSafeAreaInsets();
  const { decks, activeDeck, select, displayLimit } = useDecks();
  const { cards, loading, update, remove } = useActiveCards();
  const [editing, setEditing] = useState<Flashcard | null>(null);
  const [sourceText, setSourceText] = useState('');
  const [destinationText, setDestinationText] = useState('');
  const [exampleText, setExampleText] = useState('');

  const openEdit = (card: Flashcard) => {
    setEditing(card);
    setSourceText(card.sourceText);
    setDestinationText(card.destinationText);
    setExampleText(card.exampleText);
  };

  const saveEdit = async () => {
    if (!editing) return;
    if (!sourceText.trim() || !destinationText.trim()) {
      Alert.alert('Missing fields', 'Both sides of the card are required.');
      return;
    }
    await update(editing.id, { sourceText, destinationText, exampleText });
    setEditing(null);
  };

  const confirmDelete = (card: Flashcard) => {
    Alert.alert('Delete card?', `"${card.sourceText}" will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => void remove(card.id),
      },
    ]);
  };

  if (!activeDeck) {
    return (
      <ScreenBackground>
        <BrandHeader subtitle="Active cards" />
        <EmptyState
          image={require('../../assets/images/empty-pool.png')}
          title="No language pair"
          message="Create a source → destination pair in Settings first."
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
      {loading ? (
        <ActivityIndicator color={colors.orange} style={{ marginTop: 40 }} />
      ) : cards.length === 0 ? (
        <EmptyState
          image={require('../../assets/images/empty-pool.png')}
          title="No active cards"
          message={`Add ${activeDeck.sourceLanguage} ↔ ${activeDeck.destinationLanguage} cards from the Add tab.`}
        />
      ) : (
        <FlatList
          data={cards}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => (
            <Animated.View
              entering={FadeInDown.duration(motion.normal)
                .delay(Math.min(index, 8) * 40)
                .springify()
                .damping(18)}
              style={styles.row}
            >
              <Pressable style={styles.main} onPress={() => openEdit(item)}>
                <Text style={styles.source}>{item.sourceText}</Text>
                <Text style={styles.destination}>{item.destinationText}</Text>
                {item.exampleText ? (
                  <Text style={styles.example} numberOfLines={2}>
                    {item.exampleText}
                  </Text>
                ) : null}
                <Text style={styles.meta}>
                  Shown {item.timesShown} / {displayLimit} · Correct{' '}
                  {item.timesCorrect}
                </Text>
              </Pressable>
              <Pressable onPress={() => confirmDelete(item)} style={styles.delete}>
                <Text style={styles.deleteText}>Delete</Text>
              </Pressable>
            </Animated.View>
          )}
        />
      )}

      <Modal
        visible={!!editing}
        animationType="fade"
        transparent
        onRequestClose={() => setEditing(null)}
      >
        <KeyboardAvoidingView
          style={styles.modalRoot}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
        >
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setEditing(null)}
          />
          <View
            style={[
              styles.modalCard,
              { marginBottom: Math.max(insets.bottom, spacing.md) },
            ]}
          >
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScroll}
            >
              <Text style={styles.modalTitle}>Edit card</Text>
              <Text style={styles.modalLabel}>{activeDeck.sourceLanguage}</Text>
              <TextInput
                value={sourceText}
                onChangeText={setSourceText}
                style={styles.input}
                placeholder={activeDeck.sourceLanguage}
                placeholderTextColor={colors.tabInactive}
                autoFocus
              />
              <Text style={styles.modalLabel}>
                {activeDeck.destinationLanguage}
              </Text>
              <TextInput
                value={destinationText}
                onChangeText={setDestinationText}
                style={styles.input}
                placeholder={activeDeck.destinationLanguage}
                placeholderTextColor={colors.tabInactive}
              />
              <Text style={styles.modalLabel}>Example (optional)</Text>
              <TextInput
                value={exampleText}
                onChangeText={setExampleText}
                style={[styles.input, styles.exampleInput]}
                placeholder="A sentence using the word"
                placeholderTextColor={colors.tabInactive}
                multiline
              />
              <View style={styles.modalActions}>
                <Pressable
                  onPress={() => setEditing(null)}
                  style={styles.secondary}
                >
                  <Text style={styles.secondaryText}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={() => void saveEdit()}
                  style={styles.primary}
                >
                  <Text style={styles.primaryText}>Save</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
  },
  row: {
    backgroundColor: colors.paper,
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.paperEdge,
    ...shadows.soft,
  },
  main: {
    flex: 1,
    gap: 4,
  },
  source: {
    fontFamily: fonts.display,
    fontSize: 22,
    letterSpacing: -0.3,
    color: colors.ink,
  },
  destination: {
    fontFamily: fonts.bodyMedium,
    fontSize: 16,
    color: colors.slate,
  },
  example: {
    fontFamily: fonts.body,
    fontSize: 14,
    fontStyle: 'italic',
    color: colors.slate,
    marginTop: 2,
  },
  meta: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.tabInactive,
    marginTop: 4,
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
  modalRoot: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.overlay,
  },
  modalCard: {
    backgroundColor: colors.paper,
    borderRadius: radius.sheet,
    padding: spacing.lg,
    maxHeight: '88%',
    zIndex: 1,
    borderWidth: 1,
    borderColor: colors.paperEdge,
    ...shadows.float,
  },
  modalScroll: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  modalTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 26,
    letterSpacing: -0.3,
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  modalLabel: {
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
  exampleInput: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  secondary: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  secondaryText: {
    fontFamily: fonts.bodySemi,
    color: colors.slate,
    fontSize: 16,
  },
  primary: {
    flex: 1,
    backgroundColor: colors.orange,
    borderRadius: radius.md,
    alignItems: 'center',
    paddingVertical: spacing.md,
    ...shadows.soft,
  },
  primaryText: {
    fontFamily: fonts.bodySemi,
    color: colors.white,
    fontSize: 16,
  },
});
