import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius, spacing } from '@/src/theme';

type Props = {
  subtitle?: string;
  /** Kept for compatibility; header is always light on the teal band. */
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
        <Text style={styles.brand}>CANAL STUDY</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  markWrap: {
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    overflow: 'hidden',
  },
  mark: {
    width: 40,
    height: 40,
  },
  textCol: {
    flex: 1,
    gap: 2,
  },
  brand: {
    fontFamily: fonts.displayBold,
    fontSize: 18,
    letterSpacing: 1.4,
    color: colors.white,
  },
  subtitle: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: 'rgba(255,255,255,0.78)',
  },
});
