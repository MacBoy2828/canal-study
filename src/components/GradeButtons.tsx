import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { PressableScale } from '@/src/components/PressableScale';
import { colors, fonts, motion, radius, shadows, spacing } from '@/src/theme';

type Props = {
  visible: boolean;
  onWrong: () => void;
  onCorrect: () => void;
};

export function GradeButtons({ visible, onWrong, onCorrect }: Props) {
  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeInUp.duration(motion.normal).springify().damping(16)}
      style={styles.row}
    >
      <PressableScale
        onPress={onWrong}
        style={[styles.button, styles.wrong]}
        accessibilityLabel="Mark as wrong"
      >
        <Text style={styles.label}>Wrong</Text>
      </PressableScale>
      <PressableScale
        onPress={onCorrect}
        style={[styles.button, styles.correct]}
        accessibilityLabel="Mark as correct"
      >
        <Text style={styles.label}>Correct</Text>
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: radius.md,
    alignItems: 'center',
    ...shadows.soft,
  },
  wrong: {
    backgroundColor: colors.wrong,
  },
  correct: {
    backgroundColor: colors.correct,
  },
  label: {
    fontFamily: fonts.bodySemi,
    fontSize: 17,
    color: colors.white,
  },
});
