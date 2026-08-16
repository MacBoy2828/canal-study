import { StyleSheet, Text } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { PressableScale } from '@/src/components/PressableScale';
import { colors, fonts, motion, radius, spacing } from '@/src/theme';

type GradeProps = {
  visible: boolean;
  onWrong: () => void;
  onCorrect: () => void;
  onContinue?: never;
};

type ContinueProps = {
  visible: boolean;
  onContinue: () => void;
  onWrong?: never;
  onCorrect?: never;
};

type Props = GradeProps | ContinueProps;

export function GradeButtons(props: Props) {
  if (!props.visible) return null;

  if (props.onContinue) {
    return (
      <Animated.View
        entering={FadeInUp.duration(motion.snappy)}
        style={styles.row}
      >
        <PressableScale
          onPress={props.onContinue}
          style={[styles.button, styles.continue]}
          accessibilityLabel="Continue to the next card"
        >
          <Text style={styles.label}>Continue</Text>
        </PressableScale>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      entering={FadeInUp.duration(motion.snappy)}
      style={styles.row}
    >
      <PressableScale
        onPress={props.onWrong}
        style={[styles.button, styles.wrong]}
        accessibilityLabel="Mark as wrong"
      >
        <Text style={styles.label}>Wrong</Text>
      </PressableScale>
      <PressableScale
        onPress={props.onCorrect}
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
    gap: spacing.sm,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  wrong: {
    backgroundColor: colors.wrong,
  },
  correct: {
    backgroundColor: colors.correct,
  },
  continue: {
    backgroundColor: colors.ink,
  },
  label: {
    fontFamily: fonts.bodySemi,
    fontSize: 16,
    color: colors.white,
  },
});
