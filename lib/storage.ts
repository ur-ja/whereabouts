import { supabase } from './supabase';
import type { Entry, EntryInput } from './types';

export function getTodayDateString(): string {
  const now = new Date();
  return toDateString(now);
}

function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDays(dateStr: string, days: number): string {
  const date = new Date(`${dateStr}T12:00:00`);
  date.setDate(date.getDate() + days);
  return toDateString(date);
}

export function isToday(dateStr: string): boolean {
  return dateStr === getTodayDateString();
}

export function isFutureDate(dateStr: string): boolean {
  return dateStr > getTodayDateString();
}

export function getDateLabel(dateStr: string): string | null {
  const today = getTodayDateString();
  if (dateStr === today) return 'Today';
  if (dateStr === addDays(today, -1)) return 'Yesterday';
  return null;
}

export function formatDisplayDate(dateStr: string): string {
  const date = new Date(`${dateStr}T12:00:00`);
  const weekday = date.toLocaleDateString('en-AU', { weekday: 'long' });
  const day = date.getDate();
  const month = date.toLocaleDateString('en-AU', { month: 'long' });
  return `${weekday} ${day} ${month}`;
}

export async function getAllEntries(): Promise<Entry[]> {
  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .order('date', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getEntryByDate(date: string): Promise<Entry | null> {
  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .eq('date', date)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function upsertEntry(input: EntryInput): Promise<Entry> {
  const { data, error } = await supabase
    .from('entries')
    .upsert(
      {
        date: input.date,
        lean: input.lean,
        tags: input.tags,
        note: input.note,
      },
      { onConflict: 'date' },
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteEntryByDate(date: string): Promise<void> {
  const { error } = await supabase.from('entries').delete().eq('date', date);

  if (error) throw error;
}
