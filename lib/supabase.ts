import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// expo-secure-store adapter para mo-persist ang session sa native (APK).
// Kung wala ni, in-memory lang ang session ug mawala nig restart sa app.
const SecureStorage = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) =>
    SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

// expo-secure-store walay web implementation (mo-crash ang web dev server
// kay undefined ang native methods). Sa web, localStorage ang gamiton.
// Guard ang window para mo-ok ang static/SSR rendering sa Node.
const WebStorage = {
  getItem: (key: string) =>
    typeof window === 'undefined' ? null : window.localStorage.getItem(key),
  setItem: (key: string, value: string) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, value);
    }
  },
  removeItem: (key: string) => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key);
    }
  },
};

const sessionStorage =
  Platform.OS === 'web' ? WebStorage : SecureStorage;

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Importante: .env kay gitignored, so wala ni sa EAS cloud build
// unless gi-push ang env vars. Kung wala, undefined ni sa APK
// ug mo-fail ang sign-in — mao na ang kailangan i-guard.
export const supabaseConfigError =
  !supabaseUrl || !supabaseAnonKey
    ? 'Kulang ang Supabase config niini nga build (EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY). I-rebuild ang APK nga naay env vars.'
    : null;

if (__DEV__ && supabaseConfigError) {
  console.warn(supabaseConfigError);
}

export const supabase = createClient(
  supabaseUrl ?? 'https://missing-url.supabase.co',
  supabaseAnonKey ?? 'missing-anon-key',
  {
    auth: {
      storage: sessionStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
