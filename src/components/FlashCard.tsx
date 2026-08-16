import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  ZoomIn,
} from 'react-native-reanimated';

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
      <View style={styles.card}>
        <View style={styles.topRow}>
          <Text style={styles.mode}>
            {isChoice ? 'Choice · ' : ''}
            {prompt.promptLabel} → {prompt.answerLabel}
          </Text>
          <View style={styles.progressPill}>
            <Text style={styles.progress}>{progressLabel}</Text>
          </View>
        </View>

        {isChoice ? (
          <Animated.View
            key="choice"
            entering={FadeIn.duration(motion.normal)}
            style={styles.face}
          >
            <Text style={styles.prompt}>{prompt.prompt}</Text>
            <Text style={styles.hint}>Pick the matching word</Text>
            <View style={styles.options}>
              {prompt.options!.map((option, index) => (
                <Animated.View
                  key={option}
                  entering={FadeInDown.delay(80 + index * 50)
                    .duration(motion.normal)
                    .springify()
                    .damping(16)}
                >
                  <PressableScale
                    onPress={() => onChoose?.(option)}
                    style={styles.option}
                    accessibilityLabel={`Answer ${option}`}
                  >
                    <Text style={styles.optionText}>{option}</Text>
                  </PressableScale>
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        ) : !revealed ? (
          <Animated.View
            key="front"
            entering={ZoomIn.duration(motion.normal).springify().damping(15)}
            exiting={FadeOut.duration(140)}
            style={styles.face}
          >
            <Text style={styles.prompt}>{prompt.prompt}</Text>
            <View style={styles.hintPill}>
              <Text style={styles.hint}>Tap to reveal</Text>
            </View>
          </Animated.View>
        ) : (
          <Animated.View
            key="back"
            entering={FadeIn.duration(motion.normal)}
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
    minHeight: 380,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    borderWidth: 1,
    borderColor: colors.paperEdge,
    ...shadows.float,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  topRow: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  mode: {
    flex: 1,
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.orange,
  },
  progressPill: {
    backgroundColor: colors.mistSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  progress: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.slate,
  },
  face: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingTop: spacing.xl,
  },
  prompt: {
    fontFamily: fonts.display,
    fontSize: 42,
    lineHeight: 50,
    letterSpacing: -0.6,
    color: colors.ink,
    textAlign: 'center',
  },
  promptSmall: {
    fontFamily: fonts.bodyMedium,
    fontSize: 18,
    color: colors.slate,
    textAlign: 'center',
  },
  divider: {
    width: 56,
    height: 3,
    backgroundColor: colors.orange,
    borderRadius: 3,
    opacity: 0.85,
  },
  answer: {
    fontFamily: fonts.displayBold,
    fontSize: 38,
    lineHeight: 46,
    letterSpacing: -0.5,
    color: colors.ink,
    textAlign: 'center',
  },
  hint: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.slate,
    textAlign: 'center',
  },
  hintPill: {
    marginTop: spacing.sm,
    backgroundColor: colors.orangeGlow,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  options: {
    width: '100%',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  option: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.paperEdge,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    ...shadows.soft,
  },
  optionText: {
    fontFamily: fonts.bodySemi,
    fontSize: 18,
    color: colors.ink,
    textAlign: 'center',
  },
});
