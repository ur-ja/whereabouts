import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Card } from '../components/Card';
import { FactorBars } from '../components/FactorBars';
import { MetricCard } from '../components/MetricCard';
import { SectionHeader } from '../components/SectionHeader';
import { colors, spacing, typography } from '../constants/theme';
import { computeFactorStats, countPivots, getLeanLabel } from '../lib/lean';
import { getProfile, toUserPlaces } from '../lib/profiles';
import { getAllEntries } from '../lib/storage';
import type { Entry, UserPlaces } from '../lib/types';

export default function PartnerSummaryScreen() {
  const router = useRouter();
  const { ownerId, email } = useLocalSearchParams<{ ownerId?: string; email?: string }>();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [places, setPlaces] = useState<UserPlaces>({ placeA: 'Place A', placeB: 'Place B' });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!ownerId) {
      setEntries([]);
      return;
    }
    try {
      const [data, profile] = await Promise.all([getAllEntries(ownerId), getProfile(ownerId)]);
      setEntries(data);
      setPlaces(toUserPlaces(profile));
    } catch {
      setEntries([]);
    }
  }, [ownerId]);

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
  const partnerLabel = email ?? 'Partner';
  const currentLeanMetric = latest
    ? latest.lean === 5
      ? 'Unsure'
      : latest.lean < 5
        ? places.placeA
        : places.placeB
    : '—';

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Card>
        <SectionHeader icon="eye" title="Partner summary" />
        <Text style={styles.heading}>{partnerLabel}</Text>
        <Text style={styles.subtle}>Read-only overview of where they stand right now.</Text>
      </Card>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.textMuted} />
        </View>
      ) : (
        <>
          <View style={styles.metrics}>
            <MetricCard label="Days logged" value={String(entries.length)} />
            <MetricCard label="Current lean" value={currentLeanMetric} />
            <MetricCard label="Pivots" value={String(countPivots(entries))} />
          </View>

          <Card>
            <SectionHeader icon="compass" title="Current position" />
            <Text style={styles.current}>
              {latest
                ? getLeanLabel(latest.lean, places)
                : `${partnerLabel} has not added entries yet.`}
            </Text>
            {latest?.note ? <Text style={styles.note}>{latest.note}</Text> : null}
          </Card>

          <FactorBars factors={factors} places={places} />
        </>
      )}

      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>Back to settings</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  centered: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontSize: typography.title,
    fontWeight: '700',
    color: colors.text,
  },
  subtle: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 22,
  },
  metrics: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  current: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 24,
  },
  note: {
    fontSize: typography.body,
    color: colors.textMuted,
    lineHeight: 24,
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  backText: {
    color: colors.accent,
    fontWeight: '700',
    fontSize: typography.body,
  },
});
