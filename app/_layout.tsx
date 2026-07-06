import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../lib/auth';
import { PlacesProvider } from '../lib/places';

export default function RootLayout() {
  return (
    <AuthProvider>
      <PlacesProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="login" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </PlacesProvider>
    </AuthProvider>
  );
}
