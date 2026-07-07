export interface Entry {
  id: string;
  user_id: string;
  date: string;
  lean: number;
  tags: string[];
  note: string;
  created_at: string;
}

export interface EntryInput {
  date: string;
  lean: number;
  tags: string[];
  note: string;
}

export interface FactorStat {
  tag: string;
  count: number;
  placeACount: number;
  placeBCount: number;
}

export interface UserPlaces {
  placeA: string;
  placeB: string;
}

export interface UserProfile {
  user_id: string;
  place_a: string;
  place_b: string;
  updated_at: string;
}

export interface UserProfileInput {
  placeA: string;
  placeB: string;
}

export type ShareStatus = 'pending' | 'accepted' | 'declined';

export interface DataShare {
  id: string;
  owner_id: string;
  partner_id: string | null;
  owner_email: string | null;
  invitee_email: string;
  status: ShareStatus;
  created_at: string;
}
