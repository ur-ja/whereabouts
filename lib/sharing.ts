import { supabase } from './supabase';
import type { DataShare } from './types';

export async function getMyShares(): Promise<DataShare[]> {
  const { data, error } = await supabase
    .from('data_shares')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function invitePartner(email: string): Promise<DataShare> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');

  const normalized = email.trim().toLowerCase();
  if (!normalized.includes('@')) {
    throw new Error('Enter a valid email address');
  }
  if (user.email?.toLowerCase() === normalized) {
    throw new Error('You cannot share with yourself');
  }

  const { data, error } = await supabase
    .from('data_shares')
    .insert({
      owner_id: user.id,
      invitee_email: normalized,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('You already invited this person');
    }
    throw error;
  }

  return data;
}

export async function respondToInvite(
  shareId: string,
  accept: boolean,
): Promise<DataShare> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');

  const { data, error } = await supabase
    .from('data_shares')
    .update({
      partner_id: user.id,
      status: accept ? 'accepted' : 'declined',
    })
    .eq('id', shareId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function revokeShare(shareId: string): Promise<void> {
  const { error } = await supabase.from('data_shares').delete().eq('id', shareId);
  if (error) throw error;
}

export function getAcceptedPartners(shares: DataShare[], myUserId: string): DataShare[] {
  return shares.filter(
    (share) =>
      share.status === 'accepted' &&
      (share.owner_id === myUserId || share.partner_id === myUserId),
  );
}

export function getIncomingPending(shares: DataShare[], myEmail: string): DataShare[] {
  const email = myEmail.toLowerCase();
  return shares.filter(
    (share) =>
      share.status === 'pending' && share.invitee_email.toLowerCase() === email,
  );
}

export function getOutgoingPending(shares: DataShare[], myUserId: string): DataShare[] {
  return shares.filter(
    (share) => share.status === 'pending' && share.owner_id === myUserId,
  );
}

/** Partner whose journal I can view (they shared with me). */
export function getPartnersWhoSharedWithMe(
  shares: DataShare[],
  myUserId: string,
): { ownerId: string; email: string }[] {
  return shares
    .filter((s) => s.status === 'accepted' && s.partner_id === myUserId)
    .map((s) => ({ ownerId: s.owner_id, email: s.invitee_email }));
}
