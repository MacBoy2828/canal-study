import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius, spacing } from '@/src/theme';

type Props = {
  visible: boolean;
  onWrong: () => void;
  onCorrect: () => void;
};

export function GradeButtons({ visible, onWrong, onCorrect }: Props) {
  if (!visible) return null;

  return (
    <View style={styles.row}>
      <Pressable
        onPress={onWrong}
        style={[styles.button, styles.wrong]}
        accessibilityRole="button"
        accessibilityLabel="Mark as wrong"
      >
        <Text style={styles.label}>Wrong</Text>
      </Pressable>
      <Pressable
        onPress={onCorrect}
        style={[styles.button, styles.correct]}
        accessibilityRole="button"
        accessibilityLabel="Mark as correct"
      >
        <Text style={styles.label}>Correct</Text>
      </Pressable>
    </View>
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
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
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
