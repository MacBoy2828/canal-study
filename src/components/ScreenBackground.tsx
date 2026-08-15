import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { ImageSourcePropType, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '@/src/theme';

type Props = {
  children: ReactNode;
  heroImage?: ImageSourcePropType;
  dim?: number;
};

export function ScreenBackground({ children, heroImage, dim = 0.42 }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      {heroImage ? (
        <Image source={heroImage} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : null}
      <LinearGradient
        colors={
          heroImage
            ? [`rgba(27,42,58,${dim})`, `rgba(74,95,115,${dim + 0.15})`, colors.mist]
            : [colors.mistDeep, colors.mist, colors.paperWarm]
        }
        locations={heroImage ? [0, 0.45, 1] : [0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />
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
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
});
