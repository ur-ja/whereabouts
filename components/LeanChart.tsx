import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { Card } from './Card';
import { SectionHeader } from './SectionHeader';
import { colors, spacing, typography } from '../constants/theme';
import { getChartYLabels, getLeanColor, isSharpPivot } from '../lib/lean';
import type { Entry } from '../lib/types';
import { usePlaces } from '../lib/places';

interface LeanChartProps {
  entries: Entry[];
}

export function LeanChart({ entries }: LeanChartProps) {
  const { places } = usePlaces();
  const yLabels = getChartYLabels(places);
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - spacing.lg * 2 - spacing.lg * 2;

  if (sorted.length === 0) {
    return (
      <Card>
        <SectionHeader icon="trending-up" title="Lean over time" />
        <Text style={styles.emptyText}>Nothing logged yet. How are you feeling today?</Text>
      </Card>
    );
  }

  const spacingX =
    sorted.length > 1 ? Math.min(chartWidth / (sorted.length - 1), 72) : 40;

  const data = sorted.map((entry, index) => {
    const prev = index > 0 ? sorted[index - 1].lean : entry.lean;
    const sharp = index > 0 && isSharpPivot(prev, entry.lean);
    return {
      value: entry.lean,
      label: formatShortDate(entry.date),
      dataPointColor: getLeanColor(entry.lean),
      dataPointRadius: sharp ? 6 : 4,
      dataPointBorderWidth: sharp ? 2 : 0,
      dataPointBorderColor: colors.text,
    };
  });

  return (
    <Card style={styles.card}>
      <SectionHeader icon="trending-up" title="Lean over time" />
      <View style={styles.chartWrap}>
        <LineChart
          data={data}
          width={chartWidth}
          height={180}
          spacing={spacingX}
          initialSpacing={16}
          endSpacing={16}
          color={colors.neutral}
          thickness={2}
          hideRules
          yAxisColor="transparent"
          xAxisColor={colors.border}
          yAxisTextStyle={styles.yAxisText}
          xAxisLabelTextStyle={styles.axisText}
          noOfSections={4}
          maxValue={10}
          yAxisLabelWidth={36}
          yAxisLabelTexts={yLabels}
          formatYLabel={() => ''}
          showReferenceLine1
          referenceLine1Position={5}
          referenceLine1Config={{
            color: colors.neutral,
            dashWidth: 4,
            dashGap: 4,
            thickness: 1,
          }}
          curved={sorted.length > 2}
          areaChart={sorted.length > 1}
          startFillColor={colors.australiaTint}
          endFillColor={colors.background}
          startOpacity={0.25}
          endOpacity={0.02}
          scrollToEnd
          disableScroll={sorted.length <= 4}
        />
      </View>
    </Card>
  );
}

function formatShortDate(dateStr: string): string {
  const date = new Date(`${dateStr}T12:00:00`);
  return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

const styles = StyleSheet.create({
  card: {
    paddingBottom: spacing.sm,
  },
  chartWrap: {
    marginLeft: -spacing.xs,
    overflow: 'hidden',
  },
  yAxisText: {
    fontSize: 14,
    color: colors.text,
    width: 32,
    textAlign: 'center',
  },
  axisText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  emptyText: {
    fontSize: typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
    paddingVertical: spacing.md,
  },
});
