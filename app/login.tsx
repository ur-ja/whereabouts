import { useState } from 'react';
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
import { colors, radius, spacing, typography } from '../constants/theme';
import { getAuthRedirectUrl } from '../lib/authRedirect';
import { supabase } from '../lib/supabase';

type Mode = 'signin' | 'signup' | 'forgot';

export default function LoginScreen() {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setMessage(null);
    if (next === 'forgot') {
      setPassword('');
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setError('Enter your email');
      setLoading(false);
      return;
    }

    if (mode === 'forgot') {
      try {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
          redirectTo: getAuthRedirectUrl('/reset-password'),
        });
        if (resetError) throw resetError;
        setMessage('Check your email for a reset link.');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not send reset link');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!password) {
      setError('Enter your password');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
        });
        if (signUpError) throw signUpError;
        setMessage('Account created. You can sign in now.');
        switchMode('signin');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });
        if (signInError) throw signInError;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const submitLabel =
    loading ? 'Please wait…' : mode === 'signup' ? 'Create account' : mode === 'forgot' ? 'Send reset link' : 'Sign in';

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
          <Text style={styles.title}>Whereabouts</Text>
        </View>

        <View style={styles.card}>
          {mode !== 'forgot' ? (
            <View style={styles.tabs}>
              <Pressable
                style={[styles.tab, mode === 'signin' && styles.tabActive]}
                onPress={() => switchMode('signin')}
              >
                <Text style={[styles.tabText, mode === 'signin' && styles.tabTextActive]}>
                  Sign in
                </Text>
              </Pressable>
              <Pressable
                style={[styles.tab, mode === 'signup' && styles.tabActive]}
                onPress={() => switchMode('signup')}
              >
                <Text style={[styles.tabText, mode === 'signup' && styles.tabTextActive]}>
                  Sign up
                </Text>
              </Pressable>
            </View>
          ) : (
            <Pressable onPress={() => switchMode('signin')} style={styles.backRow}>
              <Text style={styles.backText}>← Sign in</Text>
            </Pressable>
          )}

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
            value={email}
            onChangeText={setEmail}
            placeholderTextColor={colors.textMuted}
          />

          {mode !== 'forgot' ? (
            <>
              <View style={styles.passwordRow}>
                <Text style={styles.label}>Password</Text>
                {mode === 'signin' ? (
                  <Pressable onPress={() => switchMode('forgot')} hitSlop={8}>
                    <Text style={styles.forgotText}>Forgot password?</Text>
                  </Pressable>
                ) : null}
              </View>
              <TextInput
                style={styles.input}
                secureTextEntry
                textContentType={mode === 'signup' ? 'newPassword' : 'password'}
                value={password}
                onChangeText={setPassword}
                placeholderTextColor={colors.textMuted}
              />
            </>
          ) : null}

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {message ? <Text style={styles.message}>{message}</Text> : null}

          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{submitLabel}</Text>
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
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: radius.button,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radius.button - 2,
  },
  tabActive: {
    backgroundColor: colors.card,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    opacity: 0.55,
  },
  tabTextActive: {
    color: colors.accent,
    opacity: 1,
  },
  backRow: {
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: -spacing.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  forgotText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
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
  message: {
    color: colors.india,
    fontSize: 14,
  },
});
