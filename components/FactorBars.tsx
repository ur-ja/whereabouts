import { StyleSheet, Text, View } from 'react-native';
import { Card } from './Card';
import { SectionHeader } from './SectionHeader';
import { colors, radius, spacing } from '../constants/theme';
import type { FactorStat } from '../lib/types';

interface FactorBarsProps {
  factors: FactorStat[];
}

export function FactorBars({ factors }: FactorBarsProps) {
  if (factors.length === 0) {
    return null;
  }

  const top = factors.slice(0, 6);
  const maxCount = Math.max(...top.map((f) => f.count), 1);

  return (
    <Card>
      <SectionHeader icon="bar-chart-2" title="Top factors" />
      <View style={styles.list}>
        {top.map((factor) => {
          const indiaHeavy = factor.indiaCount >= factor.australiaCount;
          const barColor = indiaHeavy ? colors.india : colors.australia;
          const widthPct = (factor.count / maxCount) * 100;

          return (
            <View key={factor.tag} style={styles.row}>
              <Text style={styles.label}>{factor.tag}</Text>
              <View style={styles.barRow}>
                <View style={styles.track}>
                  <View
                    style={[
                      styles.fill,
                      { width: `${widthPct}%`, backgroundColor: barColor },
                    ]}
                  />
                </View>
                <Text style={styles.count}>{factor.count}</Text>
              </View>
            </View>
          );
        })}
      </View>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.india }]} />
          <Text style={styles.legendText}>India-leaning days</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.australia }]} />
          <Text style={styles.legendText}>Australia-leaning days</Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
  row: {
    gap: spacing.xs,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    lineHeight: 20,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  track: {
    flex: 1,
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
    minWidth: 10,
  },
  count: {
    width: 24,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
    textAlign: 'right',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: colors.textMuted,
  },
});
