import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInLeft, FadeInRight } from 'react-native-reanimated';

import { colors, fonts, motion, radius, shadows, spacing } from '@/src/theme';

type Props = {
  subtitle?: string;
  light?: boolean;
};

export function BrandHeader({ subtitle, light = false }: Props) {
  return (
    <View style={styles.row}>
      <Animated.View
        entering={FadeInLeft.duration(motion.lush).springify().damping(16)}
        style={[styles.markWrap, light && styles.markWrapLight]}
      >
        <Image
          source={require('../../assets/images/brand-mark.png')}
          style={styles.mark}
          contentFit="cover"
        />
      </Animated.View>
      <Animated.View
        entering={FadeInRight.duration(motion.lush).delay(60).springify().damping(16)}
        style={styles.textCol}
      >
        <Text style={[styles.brand, light && styles.light]}>Canal Study</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, light && styles.lightMuted]}>
            {subtitle}
          </Text>
        ) : null}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  markWrap: {
    borderRadius: radius.md,
    ...shadows.soft,
  },
  markWrapLight: {
    borderWidth: 1,
    borderColor: 'rgba(255,248,240,0.35)',
  },
  mark: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
  },
  textCol: {
    flex: 1,
    gap: 3,
  },
  brand: {
    fontFamily: fonts.displayBold,
    fontSize: 30,
    letterSpacing: -0.4,
    color: colors.ink,
  },
  subtitle: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.slate,
  },
  light: {
    color: colors.paper,
  },
  lightMuted: {
    color: 'rgba(255,248,240,0.82)',
  },
});
