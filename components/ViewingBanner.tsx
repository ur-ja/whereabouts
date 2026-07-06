import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../constants/theme';

interface ViewingBannerProps {
  partnerEmail: string;
  onBack: () => void;
}

export function ViewingBanner({ partnerEmail, onBack }: ViewingBannerProps) {
  return (
    <View style={styles.banner}>
      <Feather name="eye" size={16} color={colors.accent} />
      <Text style={styles.text} numberOfLines={1}>
        Viewing {partnerEmail}&apos;s journal (read-only)
      </Text>
      <Pressable onPress={onBack} hitSlop={8}>
        <Text style={styles.link}>My journal</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.australiaTint,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.button,
    marginBottom: spacing.md,
  },
  text: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
  },
  link: {
    fontSize: typography.body,
    fontWeight: '700',
    color: colors.accent,
  },
});
