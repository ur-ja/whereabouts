import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../constants/theme';

type FeatherIconName = React.ComponentProps<typeof Feather>['name'];

interface SectionHeaderProps {
  icon: FeatherIconName;
  title: string;
}

export function SectionHeader({ icon, title }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <Feather name={icon} size={15} color={colors.accent} />
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.label,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
});
