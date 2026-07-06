import { Platform, Alert } from 'react-native';

export function confirmClearEntry(onConfirm: () => void) {
  if (Platform.OS === 'web') {
    if (window.confirm('Clear this day?\n\nThis will delete the log entry for this date. This cannot be undone.')) {
      onConfirm();
    }
    return;
  }

  Alert.alert(
    'Clear this day?',
    'This will delete the log entry for this date. This cannot be undone.',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: onConfirm },
    ],
  );
}
