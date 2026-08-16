import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode, useEffect } from 'react';
import { ImageSourcePropType, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '@/src/theme';

type Props = {
  children: ReactNode;
  heroImage?: ImageSourcePropType;
  dim?: number;
};

export function ScreenBackground({
  children,
  heroImage = require('../../assets/images/hero-study.png'),
}: Props) {
  const insets = useSafeAreaInsets();
  const drift = useSharedValue(0);

  useEffect(() => {
    drift.value = withRepeat(
      withTiming(1, { duration: 18000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, [drift]);

  const washStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1.08 }, { translateY: drift.value * 10 }],
  }));

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.wash, washStyle]}>
        <Image source={heroImage} style={StyleSheet.absoluteFill} contentFit="cover" />
      </Animated.View>
      <LinearGradient
        colors={[
          'rgba(244,239,232,0.28)',
          'rgba(244,239,232,0.72)',
          colors.mist,
        ]}
        locations={[0, 0.38, 0.72]}
        style={StyleSheet.absoluteFill}
      />
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
  wash: {
    ...StyleSheet.absoluteFill,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
});
