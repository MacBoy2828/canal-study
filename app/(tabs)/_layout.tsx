import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts } from '@/src/theme';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 10);
  const tabBarHeight = 56 + bottomPad;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.orange,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: {
          backgroundColor: colors.paper,
          borderTopColor: colors.paperWarm,
          height: tabBarHeight,
          paddingTop: 6,
          paddingBottom: bottomPad,
        },
        tabBarLabelStyle: {
          fontFamily: fonts.bodyMedium,
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Study',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="albums-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'Add',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cards"
        options={{
          title: 'Cards',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="archive"
        options={{
          title: 'Archive',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="archive-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
