import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient as SupabaseClientType, Session, AuthChangeEvent } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

let supabaseInstance: SupabaseClientType | null = null;

export function getSupabaseClient(): SupabaseClientType {
  if (!supabaseInstance) {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error('[Supabase] Missing URL or ANON_KEY');
    }
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
    console.log('[Supabase] Client initialized');
  }
  return supabaseInstance;
}

export async function getSession(): Promise<Session | null> {
  const client = getSupabaseClient();
  const { data, error } = await client.auth.getSession();
  if (error) {
    console.log('[Supabase] getSession error:', error.message);
    return null;
  }
  console.log('[Supabase] getSession result:', data.session ? 'has session' : 'no session');
  return data.session;
}

export function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void
): { unsubscribe: () => void } {
  const client = getSupabaseClient();
  const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
    console.log('[Supabase] onAuthStateChange:', event, session ? 'has session' : 'no session');
    callback(event, session);
  });
  return { unsubscribe: () => subscription.unsubscribe() };
}

export async function signInWithPassword(
  email: string,
  password: string
): Promise<{ session: Session | null; error: string | null }> {
  const client = getSupabaseClient();
  console.log('[Supabase] signInWithPassword called for:', email);
  
  try {
    const { data, error } = await client.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      console.log('[Supabase] signInWithPassword error:', error.message);
      return { session: null, error: error.message };
    }

    console.log('[Supabase] signInWithPassword success:', data.session ? 'got session' : 'no session');
    return { session: data.session, error: null };
  } catch (e: any) {
    console.log('[Supabase] signInWithPassword exception:', e?.message);
    return { session: null, error: e?.message || 'Unknown error' };
  }
}

export async function signUp(
  email: string,
  password: string
): Promise<{ session: Session | null; error: string | null }> {
  const client = getSupabaseClient();
  console.log('[Supabase] signUp called for:', email);

  try {
    const { data, error } = await client.auth.signUp({
      email: email.trim(),
      password,
    });

    if (error) {
      console.log('[Supabase] signUp error:', error.message);
      return { session: null, error: error.message };
    }

    console.log('[Supabase] signUp success');
    return { session: data.session, error: null };
  } catch (e: any) {
    console.log('[Supabase] signUp exception:', e?.message);
    return { session: null, error: e?.message || 'Unknown error' };
  }
}

export async function signOut(): Promise<{ error: string | null }> {
  const client = getSupabaseClient();
  console.log('[Supabase] signOut called');

  try {
    const { error } = await client.auth.signOut();
    if (error) {
      console.log('[Supabase] signOut error:', error.message);
      return { error: error.message };
    }
    console.log('[Supabase] signOut success');
    return { error: null };
  } catch (e: any) {
    console.log('[Supabase] signOut exception:', e?.message);
    return { error: e?.message || 'Unknown error' };
  }
}

export interface AuthUser {
  id: string;
  email: string;
  access_token?: string;
  refresh_token?: string;
}

export const SupabaseClient = {
  getClient: getSupabaseClient,
  getSession,
  onAuthStateChange: (callback: (user: AuthUser | null) => void) => {
    return onAuthStateChange((event, session) => {
      if (session?.user) {
        callback({
          id: session.user.id,
          email: session.user.email || '',
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        });
      } else {
        callback(null);
      }
    });
  },
  signIn: async (credentials: { email: string; password: string }) => {
    const result = await signInWithPassword(credentials.email, credentials.password);
    if (result.error) {
      return { data: null, error: { message: result.error } };
    }
    if (result.session) {
      const user: AuthUser = {
        id: result.session.user.id,
        email: result.session.user.email || '',
        access_token: result.session.access_token,
        refresh_token: result.session.refresh_token,
      };
      return { data: { user, session: user }, error: null };
    }
    return { data: null, error: { message: 'No session returned' } };
  },
  signUp: async (credentials: { email: string; password: string }) => {
    const result = await signUp(credentials.email, credentials.password);
    if (result.error) {
      return { error: { message: result.error } };
    }
    return { error: null };
  },
  signOut: async () => {
    const result = await signOut();
    return { error: result.error ? { message: result.error } : null };
  },
  getCurrentUser: (): AuthUser | null => {
    return null;
  },
};
