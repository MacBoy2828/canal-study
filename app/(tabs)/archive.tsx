import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { BrandHeader } from '@/src/components/BrandHeader';
import { DeckSwitcher } from '@/src/components/DeckSwitcher';
import { EmptyState } from '@/src/components/EmptyState';
import { ScreenBackground } from '@/src/components/ScreenBackground';
import { deckLabel } from '@/src/db/decks';
import { useArchivedCards } from '@/src/hooks/useCards';
import { useDecks } from '@/src/hooks/useDecks';
import { colors, fonts, radius, spacing } from '@/src/theme';

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
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.main}>
                <Text style={styles.source}>{item.sourceText}</Text>
                <Text style={styles.destination}>{item.destinationText}</Text>
                <Text style={styles.meta}>
                  Finished at {item.timesShown} shows · {item.timesCorrect}{' '}
                  correct
                </Text>
              </View>
              <Pressable
                onPress={() => void restore(item.id)}
                style={styles.restore}
              >
                <Text style={styles.restoreText}>Restore</Text>
              </Pressable>
            </View>
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
  restore: {
    backgroundColor: colors.mistDeep,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  restoreText: {
    fontFamily: fonts.bodySemi,
    color: colors.ink,
    fontSize: 14,
  },
});
