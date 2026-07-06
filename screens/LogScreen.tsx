import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../lib/auth';
import { Card } from '../components/Card';
import { DateCard } from '../components/DateCard';
import { JournalField } from '../components/JournalField';
import { KeyboardDoneBar } from '../components/KeyboardDoneBar';
import { LeanSlider } from '../components/LeanSlider';
import { SectionHeader } from '../components/SectionHeader';
import { TagGrid } from '../components/TagGrid';
import { Toast } from '../components/Toast';
import { ViewingBanner } from '../components/ViewingBanner';
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
    user_id: existing?.user_id ?? '',
    date,
    lean,
    tags,
    note,
    created_at: existing?.created_at ?? new Date().toISOString(),
  };
}

export default function LogScreen() {
  const router = useRouter();
  const { viewingPartner, isViewingPartner, viewSelf } = useAuth();
  const ownerId = viewingPartner?.id;
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
  const isViewingPartnerRef = useRef(isViewingPartner);
  const formOpacity = useRef(new Animated.Value(1)).current;
  const scrollRef = useRef<ScrollView>(null);
  const contentRef = useRef<View>(null);
  const journalRef = useRef<View>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const onHide = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));

    return () => {
      onShow.remove();
      onHide.remove();
    };
  }, []);

  const scrollToJournal = useCallback(() => {
    const content = contentRef.current;
    const journal = journalRef.current;
    if (!content || !journal) return;

    setTimeout(() => {
      journal.measureLayout(
        content,
        (_x, y) => {
          scrollRef.current?.scrollTo({
            y: Math.max(0, y - spacing.lg),
            animated: true,
          });
        },
        () => {},
      );
    }, Platform.OS === 'ios' ? 250 : 100);
  }, []);

  selectedDateRef.current = selectedDate;
  isEditingRef.current = isEditing;
  isViewingPartnerRef.current = isViewingPartner;

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
        setIsEditing(isViewingPartnerRef.current ? false : !entry);
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
        const entry = await getEntryByDate(date, ownerId);
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
    [applyForm, fadeForm, ownerId],
  );

  useEffect(() => {
    cacheRef.current.clear();
    setSelectedDate(today);
    loadEntry(today, { updateMode: true, animate: false });
  }, [ownerId, today, loadEntry]);

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
    if (isViewingPartner) return;
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
  const canEdit = !isViewingPartner;
  const showEdit = canEdit && hasSavedEntry && !isEditing;
  const viewingToday = isToday(selectedDate);
  const formEditable = canEdit && isEditing;

  return (
    <View style={styles.flex}>
      <ScrollView
        ref={scrollRef}
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={[
          styles.container,
          keyboardVisible && styles.containerWithKeyboard,
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        onScrollBeginDrag={Keyboard.dismiss}
        showsVerticalScrollIndicator={false}
      >
        <View ref={contentRef} collapsable={false} style={styles.content}>
        {isViewingPartner && viewingPartner && (
          <ViewingBanner partnerEmail={viewingPartner.email} onBack={viewSelf} />
        )}
        <DateCard
          selectedDate={selectedDate}
          canGoForward={canGoForward}
          showEdit={showEdit}
          showClear={canEdit && hasSavedEntry}
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
              editable={formEditable}
              isToday={viewingToday}
            />
          </Card>

          <Card>
            <SectionHeader icon="tag" title="What influenced you" />
            <TagGrid
              selectedTags={tags}
              onChange={setTags}
              lean={lean}
              editable={formEditable}
            />
          </Card>

          <View ref={journalRef} collapsable={false}>
            <Card>
              <SectionHeader icon="file-text" title="Journal" />
              <JournalField
                note={note}
                onChange={setNote}
                editable={formEditable}
                isToday={viewingToday}
                onFocus={scrollToJournal}
              />
            </Card>
          </View>

          {formEditable && !keyboardVisible && (
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
        </View>
      </ScrollView>

      <KeyboardDoneBar />
      <Toast message={toast.message} visible={toast.visible} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  containerWithKeyboard: {
    paddingBottom: spacing.sm,
  },
  content: {
    gap: spacing.md,
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
