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
          <PressableScale
            key={deck.id}
            onPress={() => onSelect(deck.id)}
            style={[
              styles.chip,
              light && styles.chipLight,
              active && (light ? styles.chipActiveLight : styles.chipActive),
            ]}
            accessibilityLabel={`Select ${deckLabel(deck)}`}
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
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.paperEdge,
    ...shadows.soft,
  },
  chipLight: {
    backgroundColor: colors.glassDark,
    borderColor: 'rgba(255,248,240,0.28)',
  },
  chipActive: {
    backgroundColor: colors.orange,
    borderColor: colors.orangeDeep,
  },
  chipActiveLight: {
    backgroundColor: colors.orange,
    borderColor: colors.orangeSoft,
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
