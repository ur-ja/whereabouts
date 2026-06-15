import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, radius, shadow, spacing, typography } from '../constants/theme';
import { getLeanColor, getLeanLabel } from '../lib/lean';
import { formatDisplayDate } from '../lib/storage';
import type { Entry } from '../lib/types';

interface EntryCardProps {
  entry: Entry;
  onPress?: () => void;
  onClear?: () => void;
}

export function EntryCard({ entry, onPress, onClear }: EntryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const leanColor = getLeanColor(entry.lean);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && onPress && styles.cardPressed]}
    >
      <View style={styles.header}>
        <Text style={styles.date}>{formatDisplayDate(entry.date)}</Text>
        {onClear && (
          <Pressable
            onPress={onClear}
            style={styles.clearButton}
            hitSlop={8}
            accessibilityLabel="Clear entry"
          >
            <Feather name="trash-2" size={18} color={colors.destructive} />
          </Pressable>
        )}
      </View>
      <View style={[styles.leanPill, { backgroundColor: `${leanColor}18`, borderColor: leanColor }]}>
        <Text style={[styles.leanText, { color: leanColor }]}>
          {getLeanLabel(entry.lean)}
        </Text>
      </View>
      {entry.tags.length > 0 && (
        <View style={styles.tags}>
          {entry.tags.map((tag) => (
            <View key={tag} style={styles.tagChip}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
      {entry.note ? (
        <Pressable onPress={() => setExpanded(!expanded)}>
          <Text
            style={styles.note}
            numberOfLines={expanded ? undefined : 2}
          >
            {entry.note}
          </Text>
        </Pressable>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.card,
    borderWidth: 0.5,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadow.card,
  },
  cardPressed: {
    opacity: 0.85,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  clearButton: {
    padding: spacing.xs,
  },
  date: {
    flex: 1,
    fontSize: typography.title,
    fontWeight: '600',
    color: colors.text,
  },
  leanPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
    borderWidth: 0.5,
  },
  leanText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  tagChip: {
    backgroundColor: colors.neutralTint,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  tagText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  note: {
    fontSize: typography.body,
    color: colors.text,
    lineHeight: 24,
  },
});
