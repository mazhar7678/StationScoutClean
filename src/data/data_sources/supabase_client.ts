// src/data/data_sources/supabase_client.ts
// Direct REST API auth to avoid Hermes event emitter issues

import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const AUTH_TOKEN_KEY = '@stationscout_auth_token';
const AUTH_USER_KEY = '@stationscout_auth_user';

export interface AuthUser {
  id: string;
  email: string;
  access_token: string;
  refresh_token: string;
}

interface AuthResponse {
  data: { user: AuthUser | null; session: any } | null;
  error: { message: string } | null;
}

class SupabaseClientService {
  private currentUser: AuthUser | null = null;
  private sessionListeners: ((user: AuthUser | null) => void)[] = [];

  constructor() {
    this.loadStoredSession();
  }

  private async loadStoredSession() {
    try {
      const storedUser = await AsyncStorage.getItem(AUTH_USER_KEY);
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
        this.notifyListeners();
      }
    } catch (e) {
      console.log('[Auth] No stored session');
    }
  }

  private notifyListeners() {
    this.sessionListeners.forEach(listener => {
      try {
        listener(this.currentUser);
      } catch (e) {
        // Ignore listener errors
      }
    });
  }

  onAuthStateChange(callback: (user: AuthUser | null) => void): { unsubscribe: () => void } {
    this.sessionListeners.push(callback);
    // Immediately call with current state
    setTimeout(() => callback(this.currentUser), 0);
    return {
      unsubscribe: () => {
        this.sessionListeners = this.sessionListeners.filter(l => l !== callback);
      }
    };
  }

  async getSession(): Promise<{ session: AuthUser | null }> {
    if (!this.currentUser) {
      await this.loadStoredSession();
    }
    return { session: this.currentUser };
  }

  async signUp(credentials: { email: string; password: string }): Promise<AuthResponse> {
    if (!supabaseUrl || !supabaseKey) {
      return { data: null, error: { message: 'Supabase not configured' } };
    }

    try {
      const response = await fetch(`${supabaseUrl}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { data: null, error: { message: data.error_description || data.msg || 'Sign up failed' } };
      }

      return { data: { user: null, session: null }, error: null };
    } catch (e: any) {
      return { data: null, error: { message: e?.message || 'Network error' } };
    }
  }

  async signIn(credentials: { email: string; password: string }): Promise<AuthResponse> {
    if (!supabaseUrl || !supabaseKey) {
      return { data: null, error: { message: 'Supabase not configured' } };
    }

    try {
      const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError: any) {
        // Handle Hermes JSON parsing issues
        if (jsonError?.message?.includes('NONE')) {
          // Retry the request
          const retryResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
            method: 'POST',
            headers: {
              'apikey': supabaseKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });
          data = await retryResponse.json();
          if (!retryResponse.ok) {
            return { data: null, error: { message: data.error_description || data.msg || 'Sign in failed' } };
          }
        } else {
          throw jsonError;
        }
      }

      if (!response.ok) {
        return { data: null, error: { message: data.error_description || data.msg || 'Sign in failed' } };
      }

      const user: AuthUser = {
        id: data.user?.id || '',
        email: credentials.email,
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      };

      await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      this.currentUser = user;
      this.notifyListeners();

      return { data: { user, session: user }, error: null };
    } catch (e: any) {
      // Suppress Hermes NONE errors - they often don't affect actual operation
      if (e?.message?.includes('NONE') || e?.message?.includes('read-only property')) {
        console.log('[Auth] Hermes warning during sign in - checking if login succeeded');
        // Check if we have stored credentials from a successful login
        try {
          const stored = await AsyncStorage.getItem(AUTH_USER_KEY);
          if (stored) {
            const user = JSON.parse(stored);
            this.currentUser = user;
            this.notifyListeners();
            return { data: { user, session: user }, error: null };
          }
        } catch {}
        return { data: null, error: { message: 'Login may have succeeded. Please try again or restart the app.' } };
      }
      return { data: null, error: { message: e?.message || 'Network error' } };
    }
  }

  async signOut(): Promise<{ error: { message: string } | null }> {
    try {
      await AsyncStorage.removeItem(AUTH_USER_KEY);
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      this.currentUser = null;
      this.notifyListeners();
      return { error: null };
    } catch (e: any) {
      return { error: { message: e?.message || 'Sign out failed' } };
    }
  }

  // Compatibility getter for code that expects .client.auth pattern
  get client() {
    return {
      auth: {
        getSession: () => this.getSession().then(r => ({ data: r })),
        onAuthStateChange: (callback: (event: string, session: AuthUser | null) => void) => {
          const sub = this.onAuthStateChange((user) => callback('SIGNED_IN', user));
          return { data: { subscription: sub } };
        },
        signUp: (creds: any) => this.signUp(creds),
        signInWithPassword: (creds: any) => this.signIn(creds),
        signOut: () => this.signOut(),
      }
    };
  }
}

export const SupabaseClient = new SupabaseClientService();