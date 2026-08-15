import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { deckLabel } from '@/src/db/decks';
import type { Deck } from '@/src/db/types';
import { colors, fonts, radius, spacing } from '@/src/theme';

type Props = {
  decks: Deck[];
  activeDeckId: string | null;
  onSelect: (id: string) => void;
  light?: boolean;
};

export function DeckSwitcher({
  decks,
  activeDeckId,
  onSelect,
  light = false,
}: Props) {
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
          <Pressable
            key={deck.id}
            onPress={() => onSelect(deck.id)}
            style={[
              styles.chip,
              light && styles.chipLight,
              active && (light ? styles.chipActiveLight : styles.chipActive),
            ]}
          >
            <Text
              style={[
                styles.chipText,
                light && styles.chipTextLight,
                active && styles.chipTextActive,
              ]}
            >
              {deckLabel(deck)}
            </Text>
          </Pressable>
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.paperWarm,
  },
  chipLight: {
    backgroundColor: 'rgba(247, 243, 236, 0.18)',
    borderColor: 'rgba(247, 243, 236, 0.35)',
  },
  chipActive: {
    backgroundColor: colors.orange,
    borderColor: colors.orange,
  },
  chipActiveLight: {
    backgroundColor: colors.orange,
    borderColor: colors.orange,
  },
  chipText: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.ink,
  },
  chipTextLight: {
    color: colors.paper,
  },
  chipTextActive: {
    color: colors.white,
  },
});
