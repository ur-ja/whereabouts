import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

const isServer = typeof window === 'undefined';

function createSupabaseClient() {
  const options: Parameters<typeof createClient>[2] = {
    auth: {
      persistSession: !isServer,
      autoRefreshToken: !isServer,
      detectSessionInUrl: Platform.OS === 'web' && !isServer,
    },
  };

  if (isServer) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const ws = require('ws');
      options.realtime = { transport: ws };
    } catch {
      // build without ws on client-only installs
    }
  }

  return createClient(supabaseUrl, supabaseAnonKey, options);
}

export const supabase = createSupabaseClient();
