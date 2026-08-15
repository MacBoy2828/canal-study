import { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';

import { colors, fonts, radius, spacing } from '@/src/theme';

type Props = {
  message: string;
  visible: boolean;
  onHide: () => void;
  durationMs?: number;
};

export function Toast({ message, visible, onHide, durationMs = 1800 }: Props) {
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onHide, durationMs);
    return () => clearTimeout(timer);
  }, [visible, durationMs, onHide]);

  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeInDown.duration(200)}
      exiting={FadeOutUp.duration(180)}
      style={styles.toast}
      pointerEvents="none"
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
    bottom: spacing.lg,
    backgroundColor: colors.ink,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    shadowColor: colors.ink,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  text: {
    fontFamily: fonts.bodySemi,
    fontSize: 16,
    color: colors.paper,
  },
});
