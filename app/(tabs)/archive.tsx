import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { BrandHeader } from '@/src/components/BrandHeader';
import { DeckSwitcher } from '@/src/components/DeckSwitcher';
import { EmptyState } from '@/src/components/EmptyState';
import { PressableScale } from '@/src/components/PressableScale';
import { ScreenBackground } from '@/src/components/ScreenBackground';
import { deckLabel } from '@/src/db/decks';
import { useArchivedCards } from '@/src/hooks/useCards';
import { useDecks } from '@/src/hooks/useDecks';
import { colors, fonts, motion, radius, shadows, spacing } from '@/src/theme';

export default function ArchiveScreen() {
  const { decks, activeDeck, select } = useDecks();
  const { cards, loading, restore } = useArchivedCards();

  if (!activeDeck) {
    return (
      <ScreenBackground>
        <BrandHeader subtitle="Archive" />
        <EmptyState
          image={require('../../assets/images/empty-archive.png')}
          title="No language pair"
          message="Create a language pair in Settings to start archiving practiced cards."
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
          image={require('../../assets/images/empty-archive.png')}
          title="Archive is empty"
          message="Cards move here after they reach your display limit. You can restore them anytime."
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
              <View style={styles.main}>
                <Text style={styles.source}>{item.sourceText}</Text>
                <Text style={styles.destination}>{item.destinationText}</Text>
                <Text style={styles.meta}>
                  Finished at {item.timesShown} shows · {item.timesCorrect}{' '}
                  correct
                </Text>
              </View>
              <PressableScale
                onPress={() => void restore(item.id)}
                style={styles.restore}
              >
                <Text style={styles.restoreText}>Restore</Text>
              </PressableScale>
            </Animated.View>
          )}
        />
      )}
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
  meta: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.tabInactive,
    marginTop: 4,
  },
  restore: {
    backgroundColor: colors.mistSoft,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.paperEdge,
  },
  restoreText: {
    fontFamily: fonts.bodySemi,
    color: colors.ink,
    fontSize: 14,
  },
});
