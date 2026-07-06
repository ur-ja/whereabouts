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
import { ActivityIndicator, StyleSheet, View } from 'react-native';
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
  viewingPartner: ViewingPartner | null;
  isViewingPartner: boolean;
  viewPartner: (partner: ViewingPartner) => void;
  viewSelf: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewingPartner, setViewingPartner] = useState<ViewingPartner | null>(null);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (!nextSession) {
        setViewingPartner(null);
      }
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'login';

    if (!session && !inAuthGroup) {
      router.replace('/login');
      return;
    }

    if (session && inAuthGroup) {
      router.replace('/(tabs)/log');
    }
  }, [session, loading, segments, router]);

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
      viewingPartner,
      isViewingPartner: viewingPartner !== null,
      viewPartner,
      viewSelf,
      signOut,
    }),
    [session, loading, viewingPartner, viewPartner, viewSelf, signOut],
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
