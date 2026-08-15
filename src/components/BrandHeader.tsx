import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, spacing } from '@/src/theme';

type Props = {
  subtitle?: string;
  light?: boolean;
};

export function BrandHeader({ subtitle, light = false }: Props) {
  return (
    <View style={styles.row}>
      <Image
        source={require('../../assets/images/brand-mark.png')}
        style={styles.mark}
        contentFit="cover"
      />
      <View style={styles.textCol}>
        <Text style={[styles.brand, light && styles.light]}>Canal Study</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, light && styles.lightMuted]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
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
  mark: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  textCol: {
    flex: 1,
    gap: 2,
  },
  brand: {
    fontFamily: fonts.displayBold,
    fontSize: 28,
    color: colors.ink,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.slate,
  },
  light: {
    color: colors.paper,
  },
  lightMuted: {
    color: colors.mist,
  },
});
