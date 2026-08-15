import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { BrandHeader } from '@/src/components/BrandHeader';
import { DeckSwitcher } from '@/src/components/DeckSwitcher';
import { EmptyState } from '@/src/components/EmptyState';
import { FlashCardFace } from '@/src/components/FlashCard';
import { GradeButtons } from '@/src/components/GradeButtons';
import { ScreenBackground } from '@/src/components/ScreenBackground';
import { SwipeDeck } from '@/src/components/SwipeDeck';
import { deckLabel } from '@/src/db/decks';
import { useStudySession } from '@/src/hooks/useStudySession';
import { colors, fonts, spacing } from '@/src/theme';

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
  } = useStudySession();

  if (loading) {
    return (
      <ScreenBackground heroImage={require('../../assets/images/hero-study.png')}>
        <BrandHeader subtitle="Flashcards" light />
        <View style={styles.center}>
          <ActivityIndicator color={colors.paper} size="large" />
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

  return (
    <ScreenBackground heroImage={require('../../assets/images/hero-study.png')}>
      <BrandHeader subtitle="Tap to reveal · swipe to grade" light />
      <DeckSwitcher
        decks={decks}
        activeDeckId={activeDeck.id}
        onSelect={(id) => void select(id)}
        light
      />
      <Animated.View
        key={current.card.id + current.mode + activeDeck.id}
        entering={FadeInDown.duration(320)}
        style={styles.stage}
      >
        <SwipeDeck enabled={revealed} onGrade={grade}>
          <FlashCardFace
            prompt={current}
            revealed={revealed}
            progressLabel={progressLabel}
            onReveal={reveal}
          />
        </SwipeDeck>
        <GradeButtons
          visible={revealed}
          onWrong={() => void grade(false)}
          onCorrect={() => void grade(true)}
        />
        <Text style={styles.poolHint}>
          {deckLabel(activeDeck)} · {poolSize} card
          {poolSize === 1 ? '' : 's'}
        </Text>
      </Animated.View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stage: {
    flex: 1,
    justifyContent: 'center',
  },
  poolHint: {
    marginTop: spacing.md,
    textAlign: 'center',
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.mist,
  },
});
