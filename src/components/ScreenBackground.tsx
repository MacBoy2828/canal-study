import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode, useEffect } from 'react';
import { ImageSourcePropType, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '@/src/theme';

type Props = {
  children: ReactNode;
  heroImage?: ImageSourcePropType;
  dim?: number;
};

function DriftBlob({
  color,
  size,
  top,
  left,
  delayMs,
}: {
  color: string;
  size: number;
  top: number;
  left: number;
  delayMs: number;
}) {
  const drift = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    drift.value = withDelay(
      delayMs,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 5200, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 5200, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
    pulse.value = withDelay(
      delayMs,
      withRepeat(
        withSequence(
          withTiming(1.08, { duration: 4200, easing: Easing.inOut(Easing.quad) }),
          withTiming(1, { duration: 4200, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        false
      )
    );
  }, [delayMs, drift, pulse]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: drift.value * 18 },
      { translateX: drift.value * -10 },
      { scale: pulse.value },
    ],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.blob,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          top,
          left,
        },
        style,
      ]}
    />
  );
}

export function ScreenBackground({ children, heroImage, dim = 0.38 }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      {heroImage ? (
        <Image source={heroImage} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : (
        <>
          <LinearGradient
            colors={[colors.mistDeep, colors.mist, colors.mistSoft, colors.paperWarm]}
            locations={[0, 0.35, 0.7, 1]}
            style={StyleSheet.absoluteFill}
          />
          <DriftBlob
            color="rgba(227, 90, 31, 0.16)"
            size={220}
            top={-40}
            left={-60}
            delayMs={0}
          />
          <DriftBlob
            color="rgba(143, 174, 202, 0.35)"
            size={260}
            top={180}
            left={160}
            delayMs={900}
          />
          <DriftBlob
            color="rgba(255, 248, 240, 0.55)"
            size={180}
            top={420}
            left={-30}
            delayMs={1400}
          />
        </>
      )}
      {heroImage ? (
        <LinearGradient
          colors={[
            `rgba(20,36,51,${dim + 0.08})`,
            `rgba(61,81,99,${dim + 0.12})`,
            colors.mist,
          ]}
          locations={[0, 0.48, 1]}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + spacing.md,
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
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  blob: {
    position: 'absolute',
  },
});
