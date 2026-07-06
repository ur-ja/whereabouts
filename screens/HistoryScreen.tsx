import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { EntryCard } from '../components/EntryCard';
import { ViewingBanner } from '../components/ViewingBanner';
import { colors, spacing, typography } from '../constants/theme';
import { useAuth } from '../lib/auth';
import { getAllEntries, deleteEntryByDate } from '../lib/storage';
import { confirmClearEntry } from '../lib/confirmClear';
import type { Entry } from '../lib/types';

export default function HistoryScreen() {
  const router = useRouter();
  const { viewingPartner, isViewingPartner, viewSelf } = useAuth();
  const ownerId = viewingPartner?.id;
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getAllEntries(ownerId);
      setEntries(data);
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

  const handleClear = (date: string) => {
    if (isViewingPartner) return;
    confirmClearEntry(async () => {
      setEntries((prev) => prev.filter((e) => e.date !== date));
      try {
        await deleteEntryByDate(date);
      } catch {
        await load();
      }
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.textMuted} />
      </View>
    );
  }

  if (entries.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>
          Nothing logged yet. How are you feeling today?
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.flex}
      contentContainerStyle={styles.list}
      data={entries}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        isViewingPartner && viewingPartner ? (
          <ViewingBanner partnerEmail={viewingPartner.email} onBack={viewSelf} />
        ) : null
      }
      renderItem={({ item }) => (
        <EntryCard
          entry={item}
          onPress={() =>
            router.push({
              pathname: '/(tabs)/log',
              params: { date: item.date },
            })
          }
          onClear={isViewingPartner ? undefined : () => handleClear(item.date)}
        />
      )}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    />
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  centered: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  emptyText: {
    fontSize: typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
  },
  list: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  separator: {
    height: spacing.md,
  },
});
