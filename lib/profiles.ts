import { supabase } from './supabase';
import type { UserProfile, UserProfileInput } from './types';

export const DEFAULT_PLACES = {
  placeA: 'India',
  placeB: 'Australia',
} as const;

export async function getProfile(userId: string): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;

  if (data) return data;

  return {
    user_id: userId,
    place_a: DEFAULT_PLACES.placeA,
    place_b: DEFAULT_PLACES.placeB,
    updated_at: new Date().toISOString(),
  };
}

export async function upsertProfile(input: UserProfileInput): Promise<UserProfile> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');

  const placeA = input.placeA.trim();
  const placeB = input.placeB.trim();
  if (!placeA || !placeB) throw new Error('Both place names are required');
  if (placeA.toLowerCase() === placeB.toLowerCase()) {
    throw new Error('Choose two different places');
  }

  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      {
        user_id: user.id,
        place_a: placeA,
        place_b: placeB,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

export function toUserPlaces(profile: Pick<UserProfile, 'place_a' | 'place_b'>) {
  return {
    placeA: profile.place_a,
    placeB: profile.place_b,
  };
}
