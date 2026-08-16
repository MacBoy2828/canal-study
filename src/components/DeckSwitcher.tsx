import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { PressableScale } from '@/src/components/PressableScale';
import { deckLabel } from '@/src/db/decks';
import type { Deck } from '@/src/db/types';
import { colors, fonts, spacing } from '@/src/theme';

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
}: Props) {
  if (decks.length === 0) return null;

  return (
    <View style={styles.wrap}>
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
              style={styles.item}
              accessibilityLabel={`Select ${deckLabel(deck)}`}
            >
              <Text style={[styles.label, active && styles.labelActive]}>
                {deckLabel(deck)}
              </Text>
              <View style={[styles.underline, active && styles.underlineActive]} />
            </PressableScale>
          );
        })}
      </ScrollView>
      <View style={styles.rule} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.md,
  },
  scroll: {
    flexGrow: 0,
  },
  row: {
    gap: spacing.lg,
    paddingRight: spacing.md,
  },
  item: {
    paddingBottom: spacing.sm,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    letterSpacing: 0.2,
    color: 'rgba(255,255,255,0.62)',
  },
  labelActive: {
    fontFamily: fonts.bodySemi,
    color: colors.white,
  },
  underline: {
    marginTop: 8,
    height: 2,
    backgroundColor: 'transparent',
  },
  underlineActive: {
    backgroundColor: colors.orange,
  },
  rule: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.22)',
    marginTop: -StyleSheet.hairlineWidth,
  },
});
