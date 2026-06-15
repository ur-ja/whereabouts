import { colors } from '../constants/theme';
import type { Entry } from './types';

export function getLeanLabel(lean: number): string {
  if (lean <= 2) return 'Strongly leaning India';
  if (lean <= 4) return 'Leaning India';
  if (lean === 5) return 'Genuinely unsure';
  if (lean <= 7) return 'Leaning Australia';
  return 'Strongly leaning Australia';
}

export function getLeanSubtitle(lean: number, isToday = true): string {
  if (isToday) {
    if (lean < 5) return "You're leaning towards India today.";
    if (lean > 5) return "You're leaning towards Australia today.";
    return "You're genuinely unsure today.";
  }
  if (lean < 5) return 'You were leaning towards India that day.';
  if (lean > 5) return 'You were leaning towards Australia that day.';
  return 'You were genuinely unsure that day.';
}

export function getLeanTint(lean: number): string {
  if (lean < 5) return colors.indiaTint;
  if (lean > 5) return colors.australiaTint;
  return colors.neutralTint;
}

export function getLeanColor(lean: number): string {
  if (lean < 5) return colors.india;
  if (lean > 5) return colors.australia;
  return colors.neutral;
}

export function getLeanFlag(lean: number): string {
  if (lean < 5) return '🇮🇳';
  if (lean > 5) return '🇦🇺';
  return '⚖️';
}

export function countPivots(entries: Entry[]): number {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  let pivots = 0;

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1].lean;
    const curr = sorted[i].lean;
    if ((prev < 5 && curr > 5) || (prev > 5 && curr < 5)) {
      pivots++;
    }
  }

  return pivots;
}

export function isSharpPivot(prevLean: number, currLean: number): boolean {
  return Math.abs(currLean - prevLean) >= 3;
}

export function computeFactorStats(entries: Entry[]) {
  const map = new Map<string, { count: number; indiaCount: number; australiaCount: number }>();

  for (const entry of entries) {
    for (const tag of entry.tags) {
      const existing = map.get(tag) ?? { count: 0, indiaCount: 0, australiaCount: 0 };
      existing.count++;
      if (entry.lean < 5) existing.indiaCount++;
      else if (entry.lean > 5) existing.australiaCount++;
      map.set(tag, existing);
    }
  }

  return Array.from(map.entries())
    .map(([tag, stats]) => ({ tag, ...stats }))
    .sort((a, b) => b.count - a.count);
}
