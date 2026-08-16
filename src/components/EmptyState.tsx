import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInUp, ZoomIn } from 'react-native-reanimated';

import { colors, fonts, motion, radius, shadows, spacing } from '@/src/theme';

type Props = {
  image: number;
  title: string;
  message: string;
};

export function EmptyState({ image, title, message }: Props) {
  return (
    <View style={styles.wrap}>
      <Animated.View
        entering={ZoomIn.duration(motion.lush).springify().damping(14)}
        style={styles.imageWrap}
      >
        <Image source={image} style={styles.image} contentFit="cover" />
      </Animated.View>
      <Animated.Text
        entering={FadeInUp.delay(80).duration(motion.normal)}
        style={styles.title}
      >
        {title}
      </Animated.Text>
      <Animated.Text
        entering={FadeIn.delay(140).duration(motion.normal)}
        style={styles.message}
      >
        {message}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
  },
  imageWrap: {
    ...shadows.lift,
    borderRadius: radius.lg,
  },
  image: {
    width: 220,
    height: 220,
    borderRadius: radius.lg,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 30,
    letterSpacing: -0.4,
    color: colors.ink,
    textAlign: 'center',
  },
  message: {
    fontFamily: fonts.body,
    fontSize: 17,
    lineHeight: 24,
    color: colors.slate,
    textAlign: 'center',
    maxWidth: 320,
  },
});
