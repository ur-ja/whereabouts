import { Feather } from '@expo/vector-icons';
import { Keyboard, Pressable, StyleSheet, Text, View } from 'react-native';
import { Card } from './Card';
import { colors, radius, spacing, typography } from '../constants/theme';
import { formatDisplayDate, getDateLabel, isToday } from '../lib/storage';

interface DateCardProps {
  selectedDate: string;
  canGoForward: boolean;
  showEdit: boolean;
  showClear?: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onEdit: () => void;
  onClear?: () => void;
}

export function DateCard({
  selectedDate,
  canGoForward,
  showEdit,
  showClear,
  onPrevious,
  onNext,
  onToday,
  onEdit,
  onClear,
}: DateCardProps) {
  const dateLabel = getDateLabel(selectedDate);

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <Pressable
          onPress={() => {
            Keyboard.dismiss();
            onPrevious();
          }}
          style={styles.arrow}
          hitSlop={6}
        >
          <Feather name="chevron-left" size={22} color={colors.textMuted} />
        </Pressable>

        <View style={styles.center}>
          <Feather name="calendar" size={18} color={colors.accent} style={styles.calendarIcon} />
          <Text style={styles.date}>{formatDisplayDate(selectedDate)}</Text>
          <View style={styles.meta}>
            {dateLabel ? (
              <Text style={styles.metaLabel}>{dateLabel.toUpperCase()}</Text>
            ) : !isToday(selectedDate) ? (
              <Pressable
                onPress={() => {
                  Keyboard.dismiss();
                  onToday();
                }}
                hitSlop={6}
              >
                <Text style={styles.link}>Back to today</Text>
              </Pressable>
            ) : null}
            {showEdit && (
              <>
                {dateLabel ? <Text style={styles.dot}>·</Text> : null}
                <Pressable onPress={onEdit} hitSlop={6}>
                  <Text style={styles.link}>Edit</Text>
                </Pressable>
              </>
            )}
            {showClear && onClear && (
              <>
                {(dateLabel || showEdit) ? <Text style={styles.dot}>·</Text> : null}
                <Pressable onPress={onClear} hitSlop={6}>
                  <Text style={styles.clearLink}>Clear</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>

        <Pressable
          onPress={() => {
            Keyboard.dismiss();
            onNext();
          }}
          style={[styles.arrow, !canGoForward && styles.arrowDisabled]}
          disabled={!canGoForward}
          hitSlop={6}
        >
          <Feather
            name="chevron-right"
            size={22}
            color={canGoForward ? colors.textMuted : colors.border}
          />
        </Pressable>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrow: {
    width: 40,
    height: 40,
    borderRadius: radius.button,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowDisabled: {
    opacity: 0.4,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  calendarIcon: {
    marginBottom: 2,
  },
  date: {
    fontSize: typography.title,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 18,
  },
  metaLabel: {
    fontSize: typography.label,
    fontWeight: '600',
    letterSpacing: 1.2,
    color: colors.textMuted,
  },
  dot: {
    color: colors.textMuted,
    fontSize: typography.label,
  },
  link: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
  },
  clearLink: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.destructive,
  },
});
