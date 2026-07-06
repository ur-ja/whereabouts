import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, radius, spacing, typography } from '../constants/theme';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { clearPasswordRecovery } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const hash = window.location.hash;
    if (/otp_expired|access_denied/.test(hash)) {
      setError('Reset link expired. Request a new one from sign in.');
    }
  }, []);

  const handleSubmit = async () => {
    setError(null);

    if (!password || !confirmPassword) {
      setError('Enter and confirm your new password');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Use at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      clearPasswordRecovery();
      router.replace('/(tabs)/log');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.hero}>
          <Text style={styles.title}>New password</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            textContentType="newPassword"
            value={password}
            onChangeText={setPassword}
            placeholderTextColor={colors.textMuted}
          />

          <Text style={styles.label}>Confirm password</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            textContentType="newPassword"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholderTextColor={colors.textMuted}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Saving…' : 'Update password'}</Text>
          </Pressable>

          <Pressable onPress={() => router.replace('/login')} style={styles.backLink}>
            <Text style={styles.backLinkText}>Back to sign in</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.lg,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  hero: {
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.display,
    fontWeight: '800',
    color: colors.text,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.card,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: -spacing.sm,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.button,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'web' ? 12 : spacing.md,
    fontSize: typography.body,
    color: colors.text,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: radius.button,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.card,
    fontSize: typography.body,
    fontWeight: '700',
  },
  error: {
    color: colors.destructive,
    fontSize: 14,
  },
  backLink: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  backLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
  },
});
