import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { PressableScale } from '@/src/components/PressableScale';
import type { StudyPrompt } from '@/src/hooks/useStudySession';
import { colors, fonts, motion, radius, shadows, spacing } from '@/src/theme';

type Props = {
  prompt: StudyPrompt;
  revealed: boolean;
  progressLabel: string;
  pickedOption?: string | null;
  onReveal: () => void;
  onChoose?: (option: string) => void;
};

function ExampleLine({ text }: { text: string }) {
  if (!text) return null;
  return <Text style={styles.example}>{text}</Text>;
}

export function FlashCardFace({
  prompt,
  revealed,
  progressLabel,
  pickedOption,
  onReveal,
  onChoose,
}: Props) {
  const isChoice = prompt.format === 'choice' && !!prompt.options?.length;
  const showAnswer = revealed && (!isChoice || !!pickedOption);

  return (
    <PressableScale
      onPress={showAnswer || (isChoice && !revealed) ? undefined : onReveal}
      style={styles.pressable}
      accessibilityLabel={
        isChoice && !revealed
          ? 'Choose the correct answer'
          : revealed
            ? 'Answer revealed'
            : 'Tap to reveal the answer'
      }
    >
      <View style={[styles.card, isChoice && styles.cardChoice]}>
        <View style={styles.topRow}>
          <Text style={styles.mode}>
            {isChoice ? 'Choice · ' : ''}
            {prompt.promptLabel} → {prompt.answerLabel}
          </Text>
          <View style={styles.progressChip}>
            <Text style={styles.progress}>{progressLabel}</Text>
          </View>
        </View>

        {isChoice && !revealed ? (
          <Animated.View
            key="choice"
            entering={FadeIn.duration(motion.snappy)}
            style={styles.face}
          >
            <Text style={styles.promptChoice}>{prompt.prompt}</Text>
            <View style={styles.options}>
              {prompt.options!.map((option) => (
                <PressableScale
                  key={option}
                  onPress={() => onChoose?.(option)}
                  style={styles.option}
                  accessibilityLabel={`Answer ${option}`}
                >
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
            <ExampleLine text={prompt.example} />
            <Text style={styles.hint}>
              {isChoice
                ? 'Tap Continue when you are ready'
                : 'Swipe right if correct · left if wrong'}
            </Text>
          </Animated.View>
        )}
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
    minHeight: 360,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.paperEdge,
    ...shadows.lift,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cardChoice: {
    minHeight: 0,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  mode: {
    flex: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.slate,
  },
  progressChip: {
    backgroundColor: colors.paperWarm,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  progress: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.slate,
  },
  face: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  prompt: {
    fontFamily: fonts.displayBold,
    fontSize: 42,
    lineHeight: 48,
    letterSpacing: -1,
    color: colors.ink,
    textAlign: 'center',
  },
  promptChoice: {
    fontFamily: fonts.displayBold,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.6,
    color: colors.ink,
    textAlign: 'center',
  },
  promptSmall: {
    fontFamily: fonts.bodyMedium,
    fontSize: 16,
    color: colors.slate,
    textAlign: 'center',
  },
  divider: {
    width: 36,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.orange,
  },
  answer: {
    fontFamily: fonts.displayBold,
    fontSize: 38,
    lineHeight: 44,
    letterSpacing: -0.8,
    color: colors.ink,
    textAlign: 'center',
  },
  example: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 22,
    fontStyle: 'italic',
    color: colors.slate,
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
  },
  hint: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.slate,
    textAlign: 'center',
  },
  options: {
    width: '100%',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  option: {
    width: '100%',
    backgroundColor: colors.mistSoft,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.paperEdge,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  optionText: {
    fontFamily: fonts.bodySemi,
    fontSize: 17,
    color: colors.ink,
    textAlign: 'center',
  },
});
