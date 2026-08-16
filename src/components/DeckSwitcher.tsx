import { ScrollView, StyleSheet, Text } from 'react-native';

import { PressableScale } from '@/src/components/PressableScale';
import { deckLabel } from '@/src/db/decks';
import type { Deck } from '@/src/db/types';
import { colors, fonts, radius, shadows, spacing } from '@/src/theme';

type Props = {
  decks: Deck[];
  activeDeckId: string | null;
  onSelect: (id: string) => void;
  light?: boolean;
};

export function DeckSwitcher({ decks, activeDeckId, onSelect }: Props) {
  if (decks.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={styles.scroll}
    >
      {decks.map((deck) => {
        const active = deck.id === activeDeckId;
        return (
          <PressableScale
            key={deck.id}
            onPress={() => onSelect(deck.id)}
            style={[styles.chip, active && styles.chipActive]}
            accessibilityLabel={`Select ${deckLabel(deck)}`}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>
              {deckLabel(deck)}
            </Text>
          </PressableScale>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    marginBottom: spacing.md,
    flexGrow: 0,
  },
  row: {
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.md,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.paperEdge,
    ...shadows.soft,
  },
  chipActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  chipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.inkSoft,
  },
  chipTextActive: {
    fontFamily: fonts.bodySemi,
    color: colors.paper,
  },
});
