import { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  FadeInDown,
  FadeOutUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

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
  const scale = useSharedValue(0.96);

  useEffect(() => {
    if (!visible || !message) return;
    scale.value = withSpring(1, { damping: 14, stiffness: 180 });
    const timer = setTimeout(onHide, durationMs);
    return () => clearTimeout(timer);
  }, [visible, message, durationMs, onHide, scale]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (!visible || !message) return null;

  return (
    <Animated.View
      entering={FadeInDown.duration(motion.snappy).springify().damping(16)}
      exiting={FadeOutUp.duration(motion.snappy)}
      style={[styles.toast, style]}
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
    color: colors.paper,
    textAlign: 'center',
  },
});
