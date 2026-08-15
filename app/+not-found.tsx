import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/src/theme';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <Text style={styles.title}>This screen doesn’t exist.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Back to Study</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: colors.mist,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.ink,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontFamily: fonts.bodySemi,
    fontSize: 16,
    color: colors.orange,
  },
});
