import { Platform } from 'react-native';

function getAppOrigin(): string | null {
  const configured = process.env.EXPO_PUBLIC_APP_URL?.trim().replace(/\/$/, '');
  if (configured) return configured;

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.location.origin;
  }

  return null;
}

export function getAuthRedirectUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const origin = getAppOrigin();

  if (origin) {
    return `${origin}${normalized}`;
  }

  return `whereabouts://${normalized.replace(/^\//, '')}`;
}
