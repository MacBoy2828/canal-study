import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { colors, fonts, radius, spacing } from '@/src/theme';
import type { StudyPrompt } from '@/src/hooks/useStudySession';

type Props = {
  prompt: StudyPrompt;
  revealed: boolean;
  progressLabel: string;
  onReveal: () => void;
};

export function FlashCardFace({
  prompt,
  revealed,
  progressLabel,
  onReveal,
}: Props) {
  return (
    <Pressable
      onPress={revealed ? undefined : onReveal}
      style={styles.pressable}
      accessibilityRole="button"
      accessibilityLabel={
        revealed ? 'Answer revealed' : 'Tap to reveal the answer'
      }
    >
      <View style={styles.card}>
        <Text style={styles.progress}>{progressLabel}</Text>
        <Text style={styles.mode}>
          {prompt.promptLabel} → {prompt.answerLabel}
        </Text>

        {!revealed ? (
          <Animated.View
            key="front"
            entering={FadeIn.duration(220)}
            exiting={FadeOut.duration(160)}
            style={styles.face}
          >
            <Text style={styles.prompt}>{prompt.prompt}</Text>
            <Text style={styles.hint}>Tap to reveal</Text>
          </Animated.View>
        ) : (
          <Animated.View
            key="back"
            entering={FadeIn.duration(240)}
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
    </Pressable>
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
    paddingVertical: spacing.xl,
    borderWidth: 1,
    borderColor: colors.paperWarm,
    shadowColor: colors.ink,
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
    justifyContent: 'center',
  },
  progress: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.lg,
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.slate,
  },
  mode: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.lg,
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: colors.orange,
  },
  face: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingTop: spacing.lg,
  },
  prompt: {
    fontFamily: fonts.display,
    fontSize: 40,
    lineHeight: 48,
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
    width: 48,
    height: 2,
    backgroundColor: colors.orangeSoft,
    borderRadius: 2,
  },
  answer: {
    fontFamily: fonts.displayBold,
    fontSize: 36,
    lineHeight: 44,
    color: colors.ink,
    textAlign: 'center',
  },
  hint: {
    marginTop: spacing.md,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.slate,
    textAlign: 'center',
  },
});
