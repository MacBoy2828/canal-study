import { ReactNode } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { colors, motion, radius, shadows, spacing } from '@/src/theme';

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  delay?: number;
  elevated?: boolean;
};

export function Surface({
  children,
  style,
  delay = 0,
  elevated = false,
}: Props) {
  return (
    <Animated.View
      entering={FadeInDown.duration(motion.normal).delay(delay)}
      style={[styles.surface, elevated && styles.elevated, style]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  surface: {
    backgroundColor: colors.paper,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.paperEdge,
    borderLeftWidth: 4,
    borderLeftColor: colors.rail,
    ...shadows.soft,
  },
  elevated: {
    ...shadows.lift,
  },
});
