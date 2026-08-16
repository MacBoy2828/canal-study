import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
} from '@expo-google-fonts/dm-sans';
import { Syne_600SemiBold, Syne_700Bold } from '@expo-google-fonts/syne';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { DATABASE_NAME, initDatabase } from '@/src/db/schema';
import { DecksProvider } from '@/src/hooks/useDecks';
import { ReminderBootstrap } from '@/src/reminders/ReminderBootstrap';
import { colors } from '@/src/theme';
import { UpdateProvider } from '@/src/updates/UpdateProvider';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Syne_600SemiBold,
    Syne_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.mist }}>
      <SQLiteProvider databaseName={DATABASE_NAME} onInit={initDatabase}>
        <DecksProvider>
          <ReminderBootstrap />
          <UpdateProvider>
            <StatusBar style="light" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.mist },
              }}
            >
              <Stack.Screen name="(tabs)" />
            </Stack>
          </UpdateProvider>
        </DecksProvider>
      </SQLiteProvider>
    </GestureHandlerRootView>
  );
}
