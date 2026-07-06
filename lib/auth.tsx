import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { useRouter, useSegments } from 'expo-router';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { colors } from '../constants/theme';
import { supabase } from './supabase';

interface ViewingPartner {
  id: string;
  email: string;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  needsPasswordReset: boolean;
  viewingPartner: ViewingPartner | null;
  isViewingPartner: boolean;
  viewPartner: (partner: ViewingPartner) => void;
  viewSelf: () => void;
  signOut: () => Promise<void>;
  clearPasswordRecovery: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function hasRecoveryHash(): boolean {
  return (
    Platform.OS === 'web' &&
    typeof window !== 'undefined' &&
    /type=recovery/.test(window.location.hash)
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsPasswordReset, setNeedsPasswordReset] = useState(hasRecoveryHash);
  const [viewingPartner, setViewingPartner] = useState<ViewingPartner | null>(null);
  const router = useRouter();
  const segments = useSegments();

  const clearPasswordRecovery = useCallback(() => {
    setNeedsPasswordReset(false);
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  const beginPasswordRecovery = useCallback(() => {
    setNeedsPasswordReset(true);
    router.replace('/reset-password');
  }, [router]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (hasRecoveryHash()) {
        setNeedsPasswordReset(true);
      }
      setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      if (!nextSession) {
        setViewingPartner(null);
        setNeedsPasswordReset(false);
        return;
      }
      if (event === 'PASSWORD_RECOVERY' || hasRecoveryHash()) {
        beginPasswordRecovery();
      }
    });

    return () => subscription.subscription.unsubscribe();
  }, [beginPasswordRecovery]);

  useEffect(() => {
    if (loading) return;

    const segment = segments[0];
    const onLogin = segment === 'login';
    const onResetPassword = segment === 'reset-password';

    if (needsPasswordReset) {
      if (!onResetPassword) {
        router.replace('/reset-password');
      }
      return;
    }

    if (!session && onResetPassword) {
      router.replace('/login');
      return;
    }

    if (!session && !onLogin) {
      router.replace('/login');
      return;
    }

    if (session && onLogin) {
      router.replace('/(tabs)/log');
    }
  }, [session, loading, segments, router, needsPasswordReset]);

  const viewPartner = useCallback((partner: ViewingPartner) => {
    setViewingPartner(partner);
  }, []);

  const viewSelf = useCallback(() => {
    setViewingPartner(null);
  }, []);

  const signOut = useCallback(async () => {
    setViewingPartner(null);
    await supabase.auth.signOut();
  }, []);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      needsPasswordReset,
      viewingPartner,
      isViewingPartner: viewingPartner !== null,
      viewPartner,
      viewSelf,
      signOut,
      clearPasswordRecovery,
    }),
    [
      session,
      loading,
      needsPasswordReset,
      viewingPartner,
      viewPartner,
      viewSelf,
      signOut,
      clearPasswordRecovery,
    ],
  );

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
