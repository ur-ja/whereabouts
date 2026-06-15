import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { FactorBars } from '../components/FactorBars';
import { LeanChart } from '../components/LeanChart';
import { MetricCard } from '../components/MetricCard';
import { colors, spacing } from '../constants/theme';
import { computeFactorStats, countPivots, getLeanFlag } from '../lib/lean';
import { getAllEntries } from '../lib/storage';
import type { Entry } from '../lib/types';

export default function DashboardScreen() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getAllEntries();
      setEntries(data);
    } catch {
      setEntries([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load().finally(() => setLoading(false));
    }, [load]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const latest = entries[0];
  const factors = computeFactorStats(entries);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.textMuted} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.metrics}>
        <MetricCard label="Days logged" value={String(entries.length)} />
        <MetricCard
          label="Current lean"
          value={latest ? getLeanFlag(latest.lean) : '—'}
        />
        <MetricCard label="Pivots" value={String(countPivots(entries))} />
      </View>

      <LeanChart entries={entries} />
      <FactorBars factors={factors} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  centered: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  metrics: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
