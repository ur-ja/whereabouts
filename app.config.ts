import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Whereabouts',
  slug: 'whereabouts',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  scheme: 'whereabouts',
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.urjaarora.whereabouts',
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#F3F4F6',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
    package: 'com.urjaarora.whereabouts',
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: ['expo-router'],
  extra: {
    eas: {
      projectId: 'b54d93bd-1f20-45c7-8b51-074672fea6ee',
    },
  },
};

export default config;
