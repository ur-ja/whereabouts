import { colors } from '../constants/theme';
import { DEFAULT_PLACES } from './profiles';
import type { Entry, UserPlaces } from './types';

function resolvePlaces(places?: UserPlaces): UserPlaces {
  return places ?? DEFAULT_PLACES;
}

export function getLeanLabel(lean: number, places?: UserPlaces): string {
  const { placeA, placeB } = resolvePlaces(places);
  if (lean <= 2) return `Strongly leaning ${placeA}`;
  if (lean <= 4) return `Leaning ${placeA}`;
  if (lean === 5) return 'Genuinely unsure';
  if (lean <= 7) return `Leaning ${placeB}`;
  return `Strongly leaning ${placeB}`;
}

export function getLeanSubtitle(lean: number, isToday = true, places?: UserPlaces): string {
  const { placeA, placeB } = resolvePlaces(places);
  if (isToday) {
    if (lean < 5) return `You're leaning towards ${placeA} today.`;
    if (lean > 5) return `You're leaning towards ${placeB} today.`;
    return "You're genuinely unsure today.";
  }
  if (lean < 5) return `You were leaning towards ${placeA} that day.`;
  if (lean > 5) return `You were leaning towards ${placeB} that day.`;
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

function abbrevPlace(name: string): string {
  const trimmed = name.trim();
  if (trimmed.length <= 3) return trimmed.toUpperCase();
  return trimmed.slice(0, 3).toUpperCase();
}

export function getLeanFlag(lean: number, places?: UserPlaces): string {
  const { placeA, placeB } = resolvePlaces(places);
  if (lean < 5) return abbrevPlace(placeA);
  if (lean > 5) return abbrevPlace(placeB);
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
  const map = new Map<string, { count: number; placeACount: number; placeBCount: number }>();

  for (const entry of entries) {
    for (const tag of entry.tags) {
      const existing = map.get(tag) ?? { count: 0, placeACount: 0, placeBCount: 0 };
      existing.count++;
      if (entry.lean < 5) existing.placeACount++;
      else if (entry.lean > 5) existing.placeBCount++;
      map.set(tag, existing);
    }
  }

  return Array.from(map.entries())
    .map(([tag, stats]) => ({ tag, ...stats }))
    .sort((a, b) => b.count - a.count);
}

export function getChartYLabels(places?: UserPlaces): string[] {
  const { placeA, placeB } = resolvePlaces(places);
  return [abbrevPlace(placeA), '', '⚖️', '', abbrevPlace(placeB)];
}
