import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from './auth';
import { DEFAULT_PLACES, getProfile, toUserPlaces, upsertProfile } from './profiles';
import type { UserPlaces } from './types';

interface PlacesContextValue {
  places: UserPlaces;
  loading: boolean;
  refresh: () => Promise<void>;
  savePlaces: (placeA: string, placeB: string) => Promise<void>;
}

const PlacesContext = createContext<PlacesContextValue | null>(null);

export function PlacesProvider({ children }: { children: ReactNode }) {
  const { user, viewingPartner } = useAuth();
  const [places, setPlaces] = useState<UserPlaces>(DEFAULT_PLACES);
  const [loading, setLoading] = useState(true);

  const profileUserId = viewingPartner?.id ?? user?.id;

  const refresh = useCallback(async () => {
    if (!profileUserId) {
      setPlaces(DEFAULT_PLACES);
      setLoading(false);
      return;
    }

    try {
      const profile = await getProfile(profileUserId);
      setPlaces(toUserPlaces(profile));
    } catch {
      setPlaces(DEFAULT_PLACES);
    } finally {
      setLoading(false);
    }
  }, [profileUserId]);

  useEffect(() => {
    setLoading(true);
    refresh();
  }, [refresh]);

  const savePlaces = useCallback(
    async (placeA: string, placeB: string) => {
      const profile = await upsertProfile({ placeA, placeB });
      if (!viewingPartner) {
        setPlaces(toUserPlaces(profile));
      }
    },
    [viewingPartner],
  );

  const value = useMemo(
    () => ({ places, loading, refresh, savePlaces }),
    [places, loading, refresh, savePlaces],
  );

  return <PlacesContext.Provider value={value}>{children}</PlacesContext.Provider>;
}

export function usePlaces() {
  const context = useContext(PlacesContext);
  if (!context) {
    throw new Error('usePlaces must be used within PlacesProvider');
  }
  return context;
}
