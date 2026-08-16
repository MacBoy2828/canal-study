import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { PressableScale } from '@/src/components/PressableScale';
import type { StudyPrompt } from '@/src/hooks/useStudySession';
import { colors, fonts, motion, radius, shadows, spacing } from '@/src/theme';

type Props = {
  prompt: StudyPrompt;
  revealed: boolean;
  progressLabel: string;
  onReveal: () => void;
  onChoose?: (option: string) => void;
};

export function FlashCardFace({
  prompt,
  revealed,
  progressLabel,
  onReveal,
  onChoose,
}: Props) {
  const isChoice = prompt.format === 'choice' && !!prompt.options?.length;

  return (
    <PressableScale
      onPress={revealed || isChoice ? undefined : onReveal}
      style={styles.pressable}
      accessibilityLabel={
        isChoice
          ? 'Choose the correct answer'
          : revealed
            ? 'Answer revealed'
            : 'Tap to reveal the answer'
      }
    >
      <View style={[styles.card, isChoice && styles.cardChoice]}>
        <View style={styles.rail} />
        <View style={styles.body}>
          <View style={styles.topRow}>
            <Text style={styles.mode}>
              {isChoice ? 'CHOICE  ·  ' : ''}
              {prompt.promptLabel.toUpperCase()} → {prompt.answerLabel.toUpperCase()}
            </Text>
            <Text style={styles.progress}>{progressLabel}</Text>
          </View>
          <View style={styles.progressTrack} />

          {isChoice ? (
            <Animated.View
              key="choice"
              entering={FadeIn.duration(motion.snappy)}
              style={styles.face}
            >
              <Text style={styles.promptChoice}>{prompt.prompt}</Text>
              <View style={styles.options}>
                {prompt.options!.map((option, index) => (
                  <PressableScale
                    key={option}
                    onPress={() => onChoose?.(option)}
                    style={styles.option}
                    accessibilityLabel={`Answer ${option}`}
                  >
                    <Text style={styles.optionIndex}>{index + 1}</Text>
                    <Text style={styles.optionText}>{option}</Text>
                  </PressableScale>
                ))}
              </View>
            </Animated.View>
          ) : !revealed ? (
            <Animated.View
              key="front"
              entering={FadeIn.duration(motion.snappy)}
              exiting={FadeOut.duration(100)}
              style={styles.face}
            >
              <Text style={styles.prompt}>{prompt.prompt}</Text>
              <Text style={styles.hint}>Tap to reveal</Text>
            </Animated.View>
          ) : (
            <Animated.View
              key="back"
              entering={FadeIn.duration(motion.snappy)}
              style={styles.face}
            >
              <Text style={styles.promptSmall}>{prompt.prompt}</Text>
              <View style={styles.divider} />
              <Text style={styles.answer}>{prompt.answer}</Text>
              <Text style={styles.hint}>
                Swipe right if correct · left if wrong
              </Text>
            </Animated.View>
          )}
        </View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: '100%',
  },
  card: {
    backgroundColor: colors.paper,
    borderRadius: radius.card,
    minHeight: 340,
    borderWidth: 1,
    borderColor: colors.paperEdge,
    ...shadows.lift,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  cardChoice: {
    minHeight: 0,
  },
  rail: {
    width: 5,
    backgroundColor: colors.rail,
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  mode: {
    flex: 1,
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    letterSpacing: 0.8,
    color: colors.rail,
  },
  progress: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.slate,
  },
  progressTrack: {
    height: 2,
    backgroundColor: colors.mistSoft,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  face: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  prompt: {
    fontFamily: fonts.displayBold,
    fontSize: 40,
    lineHeight: 46,
    letterSpacing: -0.8,
    color: colors.ink,
    textAlign: 'center',
  },
  promptChoice: {
    fontFamily: fonts.displayBold,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.4,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  promptSmall: {
    fontFamily: fonts.bodyMedium,
    fontSize: 16,
    color: colors.slate,
    textAlign: 'center',
  },
  divider: {
    width: 40,
    height: 2,
    backgroundColor: colors.orange,
  },
  answer: {
    fontFamily: fonts.displayBold,
    fontSize: 36,
    lineHeight: 42,
    letterSpacing: -0.5,
    color: colors.ink,
    textAlign: 'center',
  },
  hint: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.slate,
    textAlign: 'center',
  },
  options: {
    width: '100%',
    gap: spacing.sm,
  },
  option: {
    width: '100%',
    backgroundColor: colors.paperWarm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.paperEdge,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  optionIndex: {
    fontFamily: fonts.displayBold,
    fontSize: 14,
    color: colors.rail,
    width: 20,
  },
  optionText: {
    flex: 1,
    fontFamily: fonts.bodySemi,
    fontSize: 17,
    color: colors.ink,
  },
});
