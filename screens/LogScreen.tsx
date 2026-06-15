import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Card } from '../components/Card';
import { DateCard } from '../components/DateCard';
import { JournalField } from '../components/JournalField';
import { KeyboardDoneBar } from '../components/KeyboardDoneBar';
import { LeanSlider } from '../components/LeanSlider';
import { SectionHeader } from '../components/SectionHeader';
import { TagGrid } from '../components/TagGrid';
import { Toast } from '../components/Toast';
import { colors, radius, spacing, typography } from '../constants/theme';
import { confirmClearEntry } from '../lib/confirmClear';
import {
  addDays,
  deleteEntryByDate,
  getEntryByDate,
  getTodayDateString,
  isFutureDate,
  isToday,
  upsertEntry,
} from '../lib/storage';
import type { Entry } from '../lib/types';

const EMPTY_FORM = { lean: 5, tags: [] as string[], note: '' };

function formFromEntry(entry: Entry | null | undefined) {
  if (!entry) return { ...EMPTY_FORM, tags: [] as string[] };
  return { lean: entry.lean, tags: entry.tags, note: entry.note };
}

function buildLocalEntry(date: string, lean: number, tags: string[], note: string, existing?: Entry | null): Entry {
  return {
    id: existing?.id ?? `local-${date}`,
    date,
    lean,
    tags,
    note,
    created_at: existing?.created_at ?? new Date().toISOString(),
  };
}

export default function LogScreen() {
  const router = useRouter();
  const { date: dateParam } = useLocalSearchParams<{ date?: string }>();
  const today = getTodayDateString();
  const [selectedDate, setSelectedDate] = useState(today);
  const [lean, setLean] = useState(EMPTY_FORM.lean);
  const [tags, setTags] = useState<string[]>(EMPTY_FORM.tags);
  const [note, setNote] = useState(EMPTY_FORM.note);
  const [hasSavedEntry, setHasSavedEntry] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: '',
    visible: false,
  });

  const cacheRef = useRef(new Map<string, Entry | null>());
  const requestIdRef = useRef(0);
  const selectedDateRef = useRef(selectedDate);
  const isEditingRef = useRef(isEditing);
  const formOpacity = useRef(new Animated.Value(1)).current;

  selectedDateRef.current = selectedDate;
  isEditingRef.current = isEditing;

  const showToast = useCallback((message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast({ message, visible: false }), 2800);
  }, []);

  const applyForm = useCallback(
    (entry: Entry | null | undefined, { updateMode = true } = {}) => {
      const form = formFromEntry(entry);
      setLean(form.lean);
      setTags(form.tags);
      setNote(form.note);
      setHasSavedEntry(!!entry);
      if (updateMode) {
        setIsEditing(!entry);
      }
    },
    [],
  );

  const fadeForm = useCallback(
    (toValue: number, duration = 120) =>
      Animated.timing(formOpacity, {
        toValue,
        duration,
        useNativeDriver: true,
      }),
    [formOpacity],
  );

  const loadEntry = useCallback(
    async (date: string, { animate = true, updateMode = true } = {}) => {
      Keyboard.dismiss();

      const cached = cacheRef.current.get(date);
      if (cached !== undefined) {
        applyForm(cached, { updateMode });
      } else if (updateMode) {
        applyForm(null, { updateMode });
      }

      const requestId = ++requestIdRef.current;

      if (animate && cached === undefined) {
        fadeForm(0.55).start();
      }

      try {
        const entry = await getEntryByDate(date);
        if (requestId !== requestIdRef.current) return;

        cacheRef.current.set(date, entry);
        if (!isEditingRef.current || updateMode) {
          applyForm(entry, { updateMode });
        }
      } catch (error) {
        if (requestId !== requestIdRef.current) return;
        if (cached === undefined && updateMode) {
          applyForm(null, { updateMode });
        }
        console.warn('Failed to load entry', error);
      } finally {
        if (requestId === requestIdRef.current) {
          fadeForm(1).start();
        }
      }
    },
    [applyForm, fadeForm],
  );

  useEffect(() => {
    if (!dateParam || !/^\d{4}-\d{2}-\d{2}$/.test(dateParam) || isFutureDate(dateParam)) {
      return;
    }
    setSelectedDate(dateParam);
    router.setParams({ date: undefined });
  }, [dateParam, router]);

  useEffect(() => {
    loadEntry(selectedDate, { updateMode: true });
  }, [selectedDate, loadEntry]);

  useFocusEffect(
    useCallback(() => {
      if (isEditingRef.current) return;
      loadEntry(selectedDateRef.current, { animate: false, updateMode: false });
    }, [loadEntry]),
  );

  const handleSave = async () => {
    Keyboard.dismiss();
    setSaving(true);

    const existing = cacheRef.current.get(selectedDate) ?? null;
    const optimistic = buildLocalEntry(selectedDate, lean, tags, note, existing);

    cacheRef.current.set(selectedDate, optimistic);
    setHasSavedEntry(true);
    setIsEditing(false);

    try {
      const saved = await upsertEntry({ date: selectedDate, lean, tags, note });
      cacheRef.current.set(selectedDate, saved);
      showToast('Entry saved');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Could not save. Check Supabase setup.';
      showToast(
        message.includes('row-level security')
          ? 'Save blocked — run the RLS policy SQL in README'
          : 'Could not save entry',
      );
      console.warn('Save failed', error);
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    confirmClearEntry(async () => {
      Keyboard.dismiss();
      cacheRef.current.set(selectedDate, null);
      applyForm(null, { updateMode: true });

      try {
        await deleteEntryByDate(selectedDate);
        showToast('Entry cleared');
      } catch (error) {
        console.warn('Clear failed', error);
        showToast('Could not clear entry');
      }
    });
  };

  const canGoForward = !isToday(selectedDate);
  const showEdit = hasSavedEntry && !isEditing;
  const viewingToday = isToday(selectedDate);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        onScrollBeginDrag={Keyboard.dismiss}
        showsVerticalScrollIndicator={false}
      >
        <DateCard
          selectedDate={selectedDate}
          canGoForward={canGoForward}
          showEdit={showEdit}
          showClear={hasSavedEntry}
          onPrevious={() => setSelectedDate(addDays(selectedDate, -1))}
          onNext={() => {
            const next = addDays(selectedDate, 1);
            if (!isFutureDate(next)) setSelectedDate(next);
          }}
          onToday={() => setSelectedDate(today)}
          onEdit={() => setIsEditing(true)}
          onClear={handleClear}
        />

        <Animated.View style={[styles.sections, { opacity: formOpacity }]}>
          <Card>
            <SectionHeader icon="map-pin" title="Where are you leaning?" />
            <LeanSlider
              value={lean}
              onChange={setLean}
              editable={isEditing}
              isToday={viewingToday}
            />
          </Card>

          <Card>
            <SectionHeader icon="tag" title="What influenced you" />
            <TagGrid
              selectedTags={tags}
              onChange={setTags}
              lean={lean}
              editable={isEditing}
            />
          </Card>

          <Card>
            <SectionHeader icon="file-text" title="Journal" />
            <JournalField
              note={note}
              onChange={setNote}
              editable={isEditing}
              isToday={viewingToday}
            />
          </Card>

          {isEditing && (
            <Pressable
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.saveText}>
                {saving ? 'Saving…' : hasSavedEntry ? 'Save changes' : 'Save entry'}
              </Text>
            </Pressable>
          )}
        </Animated.View>
      </ScrollView>

      <KeyboardDoneBar />
      <Toast message={toast.message} visible={toast.visible} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  sections: {
    gap: spacing.md,
  },
  saveButton: {
    backgroundColor: colors.accent,
    borderRadius: radius.button,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveText: {
    color: colors.card,
    fontSize: typography.body,
    fontWeight: '700',
  },
});
