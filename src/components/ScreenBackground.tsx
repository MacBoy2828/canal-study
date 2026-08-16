import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '@/src/theme';

type Props = {
  children: ReactNode;
  /** Kept for call-site compatibility; hero photos are no longer used. */
  heroImage?: unknown;
  dim?: number;
};

export function ScreenBackground({ children }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.band, colors.mistDeep, colors.mist]}
        locations={[0, 0.22, 0.46]}
        style={styles.band}
      />
      <View style={styles.grid} pointerEvents="none">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <View
            key={i}
            style={[styles.gridLine, { left: `${i * 14}%` as `${number}%` }]}
          />
        ))}
      </View>
      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + spacing.sm,
            paddingBottom: spacing.sm,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.mist,
    overflow: 'hidden',
  },
  band: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '42%',
  },
  grid: {
    ...StyleSheet.absoluteFill,
    opacity: 0.08,
  },
  gridLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.ink,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
});
