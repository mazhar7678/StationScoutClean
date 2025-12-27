// src/data/data_sources/supabase_client.ts
// Using axios for reliable Android/Hermes networking

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

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
      console.log('[Auth] Attempting sign up with axios...');
      
      const response = await axios({
        method: 'POST',
        url: `${supabaseUrl}/auth/v1/signup`,
        headers: {
          'apikey': supabaseKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        data: {
          email: credentials.email,
          password: credentials.password,
        },
        timeout: 30000,
      });

      console.log('[Auth] Sign up response:', response.status);
      return { data: { user: null, session: null }, error: null };
      
    } catch (error: any) {
      console.log('[Auth] Sign up error:', error);
      
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error_description 
          || error.response?.data?.msg
          || error.response?.data?.message 
          || error.message;
        return { data: null, error: { message } };
      }
      
      return { data: null, error: { message: error?.message || 'Network error' } };
    }
  }

  async signIn(credentials: { email: string; password: string }): Promise<AuthResponse> {
    if (!supabaseUrl || !supabaseKey) {
      return { data: null, error: { message: 'Supabase not configured' } };
    }

    try {
      console.log('[Auth] Attempting sign in with axios...');
      console.log('[Auth] URL:', `${supabaseUrl}/auth/v1/token?grant_type=password`);
      
      const response = await axios({
        method: 'POST',
        url: `${supabaseUrl}/auth/v1/token?grant_type=password`,
        headers: {
          'apikey': supabaseKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        data: {
          email: credentials.email.trim(),
          password: credentials.password,
        },
        timeout: 30000,
      });

      console.log('[Auth] Sign in success, status:', response.status);
      
      const session = response.data;
      const user: AuthUser = {
        id: session.user?.id || '',
        email: credentials.email,
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      };

      await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      this.currentUser = user;
      this.notifyListeners();

      return { data: { user, session: user }, error: null };
      
    } catch (error: any) {
      console.log('[Auth] Sign in error:', error);
      console.log('[Auth] Error response:', error.response?.data);
      
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error_description 
          || error.response?.data?.msg
          || error.response?.data?.message 
          || error.message;
        return { data: null, error: { message } };
      }
      
      return { data: null, error: { message: error?.message || 'Network error' } };
    }
  }

  async signOut(): Promise<{ error: { message: string } | null }> {
    try {
      await AsyncStorage.removeItem(AUTH_USER_KEY);
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
