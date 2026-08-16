import { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';

import { colors, fonts, motion, radius, shadows, spacing } from '@/src/theme';

type Props = {
  message: string;
  visible: boolean;
  onHide: () => void;
  durationMs?: number;
};

export function Toast({
  message,
  visible,
  onHide,
  durationMs = 1800,
}: Props) {
  useEffect(() => {
    if (!visible || !message) return;
    const timer = setTimeout(onHide, durationMs);
    return () => clearTimeout(timer);
  }, [visible, message, durationMs, onHide]);

  if (!visible || !message) return null;

  return (
    <Animated.View
      entering={FadeInDown.duration(motion.snappy)}
      exiting={FadeOutUp.duration(motion.snappy)}
      style={styles.toast}
    >
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.xl,
    backgroundColor: colors.ink,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    ...shadows.lift,
  },
  text: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.white,
    textAlign: 'center',
  },
});
