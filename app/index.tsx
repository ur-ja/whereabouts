import { Redirect } from 'expo-router';
import { Platform } from 'react-native';

export default function Index() {
  if (
    Platform.OS === 'web' &&
    typeof window !== 'undefined' &&
    /type=recovery/.test(window.location.hash)
  ) {
    return <Redirect href="/reset-password" />;
  }

  return <Redirect href="/(tabs)/log" />;
}
