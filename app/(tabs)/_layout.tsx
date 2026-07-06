import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { Tabs } from 'expo-router';
import { colors, spacing } from '../../constants/theme';

function GlobeButton() {
  return (
    <View style={styles.globeWrap}>
      <View style={styles.globe}>
        <Feather name="globe" size={18} color={colors.accent} />
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: {
          color: colors.text,
          fontWeight: '700',
          fontSize: 18,
        },
        headerShadowVisible: false,
        headerTitleAlign: 'center',
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 84,
          paddingTop: spacing.sm,
          paddingBottom: spacing.lg,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="log"
        options={{
          title: 'Log',
          headerTitle: 'Whereabouts',
          headerLeft: () => <GlobeButton />,
          tabBarIcon: ({ color, size }) => (
            <Feather name="file-text" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          headerTitle: 'Patterns',
          tabBarIcon: ({ color, size }) => (
            <Feather name="grid" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          headerTitle: 'Past entries',
          tabBarIcon: ({ color, size }) => (
            <Feather name="clock" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          headerTitle: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Feather name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  globeWrap: {
    paddingLeft: spacing.md,
  },
  globe: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.australiaTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
