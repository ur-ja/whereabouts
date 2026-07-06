import { Platform } from 'react-native';

export function getAuthRedirectUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.origin}${normalized}`;
  }

  return `whereabouts://${normalized.replace(/^\//, '')}`;
}
