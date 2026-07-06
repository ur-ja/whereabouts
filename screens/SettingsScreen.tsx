import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Card } from '../components/Card';
import { SectionHeader } from '../components/SectionHeader';
import { Toast } from '../components/Toast';
import { colors, radius, spacing, typography } from '../constants/theme';
import { useAuth } from '../lib/auth';
import { usePlaces } from '../lib/places';
import {
  getIncomingPending,
  getMyShares,
  getOutgoingPending,
  getPartnersWhoSharedWithMe,
  invitePartner,
  respondToInvite,
  revokeShare,
} from '../lib/sharing';
import type { DataShare } from '../lib/types';

export default function SettingsScreen() {
  const { user, signOut, viewPartner, isViewingPartner } = useAuth();
  const { places, savePlaces } = usePlaces();
  const [shares, setShares] = useState<DataShare[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [placeA, setPlaceA] = useState(places.placeA);
  const [placeB, setPlaceB] = useState(places.placeB);
  const [savingPlaces, setSavingPlaces] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: '', visible: false });

  useEffect(() => {
    setPlaceA(places.placeA);
    setPlaceB(places.placeB);
  }, [places]);

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast({ message: '', visible: false }), 2800);
  };

  const load = useCallback(async () => {
    try {
      const data = await getMyShares();
      setShares(data);
    } catch {
      setShares([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load().finally(() => setLoading(false));
    }, [load]),
  );

  const handleInvite = async () => {
    setSubmitting(true);
    try {
      await invitePartner(inviteEmail);
      setInviteEmail('');
      showToast('Invite sent');
      await load();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not send invite');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRespond = async (shareId: string, accept: boolean) => {
    try {
      await respondToInvite(shareId, accept);
      showToast(accept ? 'Sharing enabled' : 'Invite declined');
      await load();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not update invite');
    }
  };

  const handleRevoke = async (shareId: string) => {
    try {
      await revokeShare(shareId);
      showToast('Sharing removed');
      await load();
    } catch (error) {
      showToast('Could not remove share');
    }
  };

  const handleSavePlaces = async () => {
    setSavingPlaces(true);
    try {
      await savePlaces(placeA, placeB);
      showToast('Places updated');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not save places');
    } finally {
      setSavingPlaces(false);
    }
  };

  if (!user) return null;

  const incoming = getIncomingPending(shares, user.email ?? '');
  const outgoing = getOutgoingPending(shares, user.id);
  const partnersWhoShared = getPartnersWhoSharedWithMe(shares, user.id);

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
      <Card>
        <SectionHeader icon="user" title="Account" />
        <Text style={styles.email}>{user.email}</Text>
        <Pressable style={styles.outlineButton} onPress={signOut}>
          <Text style={styles.outlineButtonText}>Sign out</Text>
        </Pressable>
      </Card>

      {!isViewingPartner && (
        <Card>
          <SectionHeader icon="map-pin" title="Places you're comparing" />
          <Text style={styles.help}>
            Name the two places you&apos;re choosing between. The slider, labels, and charts use
            these names throughout your journal.
          </Text>
          <Text style={styles.fieldLabel}>Leaning towards (left)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. India"
            placeholderTextColor={colors.textMuted}
            value={placeA}
            onChangeText={setPlaceA}
          />
          <Text style={styles.fieldLabel}>Leaning towards (right)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Australia"
            placeholderTextColor={colors.textMuted}
            value={placeB}
            onChangeText={setPlaceB}
          />
          <Pressable
            style={[styles.button, savingPlaces && styles.buttonDisabled]}
            onPress={handleSavePlaces}
            disabled={savingPlaces}
          >
            <Text style={styles.buttonText}>{savingPlaces ? 'Saving…' : 'Save places'}</Text>
          </Pressable>
        </Card>
      )}

      <Card>
        <SectionHeader icon="users" title="Share with someone" />
        <Text style={styles.help}>
          Invite your partner by email. They&apos;ll see your journal read-only after they accept.
          You each keep your own account and entries.
        </Text>
        <TextInput
          style={styles.input}
          placeholder="partner@email.com"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          keyboardType="email-address"
          value={inviteEmail}
          onChangeText={setInviteEmail}
        />
        <Pressable
          style={[styles.button, submitting && styles.buttonDisabled]}
          onPress={handleInvite}
          disabled={submitting}
        >
          <Text style={styles.buttonText}>{submitting ? 'Sending…' : 'Send invite'}</Text>
        </Pressable>
      </Card>

      {loading ? (
        <ActivityIndicator color={colors.textMuted} />
      ) : (
        <>
          {incoming.length > 0 && (
            <Card>
              <SectionHeader icon="inbox" title="Invites for you" />
              {incoming.map((share) => (
                <View key={share.id} style={styles.row}>
                  <Text style={styles.rowText}>Share request (from their account)</Text>
                  <View style={styles.rowActions}>
                    <Pressable onPress={() => handleRespond(share.id, true)}>
                      <Text style={styles.link}>Accept</Text>
                    </Pressable>
                    <Pressable onPress={() => handleRespond(share.id, false)}>
                      <Text style={styles.mutedLink}>Decline</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </Card>
          )}

          {outgoing.length > 0 && (
            <Card>
              <SectionHeader icon="send" title="Pending invites" />
              {outgoing.map((share) => (
                <View key={share.id} style={styles.row}>
                  <Text style={styles.rowText}>{share.invitee_email}</Text>
                  <Pressable onPress={() => handleRevoke(share.id)}>
                    <Text style={styles.mutedLink}>Cancel</Text>
                  </Pressable>
                </View>
              ))}
            </Card>
          )}

          {partnersWhoShared.length > 0 && (
            <Card>
              <SectionHeader icon="eye" title="Shared with you" />
              {partnersWhoShared.map((partner) => (
                <View key={partner.ownerId} style={styles.row}>
                  <Text style={styles.rowText}>{partner.email}</Text>
                  <Pressable
                    onPress={() =>
                      viewPartner({ id: partner.ownerId, email: 'shared journal' })
                    }
                  >
                    <Text style={styles.link}>View journal</Text>
                  </Pressable>
                </View>
              ))}
            </Card>
          )}
        </>
      )}

      <Toast message={toast.message} visible={toast.visible} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xl * 2,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  email: {
    fontSize: typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  help: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 22,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.button,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.body,
    color: colors.text,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: radius.button,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    color: colors.card,
    fontWeight: '700',
    fontSize: typography.body,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.button,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  outlineButtonText: {
    color: colors.text,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rowText: {
    flex: 1,
    fontSize: typography.body,
    color: colors.text,
  },
  rowActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  link: {
    color: colors.accent,
    fontWeight: '700',
    fontSize: typography.body,
  },
  mutedLink: {
    color: colors.textMuted,
    fontWeight: '600',
    fontSize: typography.body,
  },
});
