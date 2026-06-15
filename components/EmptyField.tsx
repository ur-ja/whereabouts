import { StyleSheet, Text, View } from 'react-native';
import { colors, emptyPlaceholder, radius, spacing } from '../constants/theme';

interface EmptyFieldProps {
  text: string;
}

export function EmptyField({ text }: EmptyFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: radius.button,
    padding: spacing.md,
    minHeight: 48,
    justifyContent: 'center',
  },
  text: emptyPlaceholder,
});
