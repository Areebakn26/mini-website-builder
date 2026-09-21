import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://') && 
  !supabaseUrl.includes('your-supabase-url')
);

if (!isSupabaseConfigured && import.meta.env.DEV) {
  console.warn(
    '⚠️ Supabase environment variables missing or unconfigured. App will run in offline LocalStorage mode.'
  );
}

// Fallback stub client for when Supabase is not configured to avoid app crashes
const dummyClient = {
  auth: {
    getSession: async () => ({ data: { session: null } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: async () => { throw new Error('Supabase URL/Key missing in .env'); },
    signUp: async () => { throw new Error('Supabase URL/Key missing in .env'); },
    signInWithOAuth: async () => { throw new Error('Supabase URL/Key missing in .env'); },
    signOut: async () => ({ error: null }),
  },
  from: () => ({
    select: () => ({ eq: () => ({ order: () => Promise.resolve({ data: [], error: null }) }) }),
    insert: () => ({ select: () => Promise.resolve({ data: [], error: null }) }),
    update: () => ({ eq: () => Promise.resolve({ error: null }) }),
    delete: () => ({ eq: () => Promise.resolve({ error: null }) }),
  })
};

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : dummyClient;
