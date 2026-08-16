import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { BrandHeader } from '@/src/components/BrandHeader';
import { DeckSwitcher } from '@/src/components/DeckSwitcher';
import { EmptyState } from '@/src/components/EmptyState';
import { FlashCardFace } from '@/src/components/FlashCard';
import { GradeButtons } from '@/src/components/GradeButtons';
import { ScreenBackground } from '@/src/components/ScreenBackground';
import { SwipeDeck } from '@/src/components/SwipeDeck';
import { deckLabel } from '@/src/db/decks';
import { useStudySession } from '@/src/hooks/useStudySession';
import { colors, fonts, motion, radius, spacing } from '@/src/theme';

export default function StudyScreen() {
  const {
    current,
    revealed,
    loading,
    poolSize,
    progressLabel,
    activeDeck,
    decks,
    select,
    reveal,
    grade,
    answerChoice,
    confirmChoice,
    pickedOption,
  } = useStudySession();

  if (loading) {
    return (
      <ScreenBackground>
        <BrandHeader subtitle="Flashcards" />
        <View style={styles.center}>
          <ActivityIndicator color={colors.orange} size="large" />
        </View>
      </ScreenBackground>
    );
  }

  if (!activeDeck) {
    return (
      <ScreenBackground>
        <BrandHeader subtitle="Flashcards" />
        <EmptyState
          image={require('../../assets/images/empty-pool.png')}
          title="Choose your languages"
          message="Create a language pair in Settings (for example Spanish → English), then add cards and study."
        />
      </ScreenBackground>
    );
  }

  if (!current || poolSize === 0) {
    return (
      <ScreenBackground>
        <BrandHeader subtitle={deckLabel(activeDeck)} />
        <DeckSwitcher
          decks={decks}
          activeDeckId={activeDeck.id}
          onSelect={(id) => void select(id)}
        />
        <EmptyState
          image={require('../../assets/images/empty-pool.png')}
          title="No cards in this pair"
          message={`Add words for ${deckLabel(activeDeck)} from the Add tab, then come back to study.`}
        />
      </ScreenBackground>
    );
  }

  const isChoice = current.format === 'choice';

  return (
    <ScreenBackground>
      <BrandHeader
        subtitle={
          isChoice
            ? revealed
              ? 'Tap Continue for the next card'
              : 'Choose the matching word'
            : 'Tap to reveal · swipe to grade'
        }
      />
      <DeckSwitcher
        decks={decks}
        activeDeckId={activeDeck.id}
        onSelect={(id) => void select(id)}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.stage}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          key={current.card.id + current.mode + current.format + activeDeck.id}
          entering={FadeIn.duration(motion.snappy)}
          style={styles.deckBlock}
        >
          <SwipeDeck enabled={!isChoice && revealed} onGrade={grade}>
            <FlashCardFace
              prompt={current}
              revealed={revealed}
              progressLabel={progressLabel}
              pickedOption={pickedOption}
              onReveal={reveal}
              onChoose={answerChoice}
            />
          </SwipeDeck>
        </Animated.View>
        {isChoice && revealed ? (
          <GradeButtons
            visible
            onContinue={() => void confirmChoice()}
          />
        ) : !isChoice ? (
          <GradeButtons
            visible={revealed}
            onWrong={() => void grade(false)}
            onCorrect={() => void grade(true)}
          />
        ) : null}
        <Text style={styles.poolHint}>
          {deckLabel(activeDeck)} · {poolSize} card
          {poolSize === 1 ? '' : 's'}
        </Text>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  stage: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  deckBlock: {
    width: '100%',
  },
  poolHint: {
    alignSelf: 'center',
    textAlign: 'center',
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.slate,
    backgroundColor: colors.glass,
    overflow: 'hidden',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.paperEdge,
  },
});
