import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, shadows, spacing } from '@/src/theme';

type Props = {
  subtitle?: string;
  light?: boolean;
};

export function BrandHeader({ subtitle }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.markWrap}>
        <Image
          source={require('../../assets/images/brand-mark.png')}
          style={styles.mark}
          contentFit="cover"
        />
      </View>
      <View style={styles.textCol}>
        <Text style={styles.brand}>Canal</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  markWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    overflow: 'hidden',
    ...shadows.soft,
  },
  mark: {
    width: 48,
    height: 48,
  },
  textCol: {
    flex: 1,
    gap: 2,
  },
  brand: {
    fontFamily: fonts.displayBold,
    fontSize: 28,
    letterSpacing: -0.8,
    color: colors.ink,
  },
  subtitle: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.slate,
  },
});
