import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { BrandHeader } from '@/src/components/BrandHeader';
import { DeckSwitcher } from '@/src/components/DeckSwitcher';
import { EmptyState } from '@/src/components/EmptyState';
import { ScreenBackground } from '@/src/components/ScreenBackground';
import { deckLabel } from '@/src/db/decks';
import type { Flashcard } from '@/src/db/types';
import { useActiveCards } from '@/src/hooks/useCards';
import { useDecks } from '@/src/hooks/useDecks';
import { colors, fonts, radius, spacing } from '@/src/theme';

export default function CardsScreen() {
  const { decks, activeDeck, select, displayLimit } = useDecks();
  const { cards, loading, update, remove } = useActiveCards();
  const [editing, setEditing] = useState<Flashcard | null>(null);
  const [sourceText, setSourceText] = useState('');
  const [destinationText, setDestinationText] = useState('');

  const openEdit = (card: Flashcard) => {
    setEditing(card);
    setSourceText(card.sourceText);
    setDestinationText(card.destinationText);
  };

  const saveEdit = async () => {
    if (!editing) return;
    if (!sourceText.trim() || !destinationText.trim()) {
      Alert.alert('Missing fields', 'Both sides of the card are required.');
      return;
    }
    await update(editing.id, { sourceText, destinationText });
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
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Pressable style={styles.main} onPress={() => openEdit(item)}>
                <Text style={styles.source}>{item.sourceText}</Text>
                <Text style={styles.destination}>{item.destinationText}</Text>
                <Text style={styles.meta}>
                  Shown {item.timesShown} / {displayLimit} · Correct{' '}
                  {item.timesCorrect}
                </Text>
              </Pressable>
              <Pressable onPress={() => confirmDelete(item)} style={styles.delete}>
                <Text style={styles.deleteText}>Delete</Text>
              </Pressable>
            </View>
          )}
        />
      )}

      <Modal visible={!!editing} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit card</Text>
            <TextInput
              value={sourceText}
              onChangeText={setSourceText}
              style={styles.input}
              placeholder={activeDeck.sourceLanguage}
              placeholderTextColor={colors.tabInactive}
            />
            <TextInput
              value={destinationText}
              onChangeText={setDestinationText}
              style={styles.input}
              placeholder={activeDeck.destinationLanguage}
              placeholderTextColor={colors.tabInactive}
            />
            <View style={styles.modalActions}>
              <Pressable onPress={() => setEditing(null)} style={styles.secondary}>
                <Text style={styles.secondaryText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={() => void saveEdit()} style={styles.primary}>
                <Text style={styles.primaryText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
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
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  main: {
    flex: 1,
    gap: 4,
  },
  source: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.ink,
  },
  destination: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.slate,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.paper,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  modalTitle: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.ink,
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
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
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
  },
  primaryText: {
    fontFamily: fonts.bodySemi,
    color: colors.white,
    fontSize: 16,
  },
});
