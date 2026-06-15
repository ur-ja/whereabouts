import { Alert } from 'react-native';

export function confirmClearEntry(onConfirm: () => void) {
  Alert.alert(
    'Clear this day?',
    'This will delete the log entry for this date. This cannot be undone.',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: onConfirm },
    ],
  );
}
