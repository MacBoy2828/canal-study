import { Image } from 'expo-image';
import { ImageSourcePropType, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, spacing } from '@/src/theme';

type Props = {
  image: ImageSourcePropType;
  title: string;
  message: string;
};

export function EmptyState({ image, title, message }: Props) {
  return (
    <View style={styles.wrap}>
      <Image source={image} style={styles.image} contentFit="contain" />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  image: {
    width: 220,
    height: 220,
    borderRadius: 24,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.ink,
    textAlign: 'center',
  },
  message: {
    fontFamily: fonts.body,
    fontSize: 17,
    lineHeight: 24,
    color: colors.slate,
    textAlign: 'center',
    maxWidth: 300,
  },
});
