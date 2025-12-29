import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient as SupabaseClientType } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export interface AuthUser {
  id: string;
  email: string;
  access_token?: string;
  refresh_token?: string;
}

export interface AuthResponse {
  data: { user: AuthUser | null; session: AuthUser | null } | null;
  error: { message: string } | null;
}

type AuthListener = (user: AuthUser | null) => void;

const AUTH_USER_KEY = 'supabase_user';

class SupabaseClientWrapper {
  private supabase: SupabaseClientType | null = null;
  private currentUser: AuthUser | null = null;
  private listeners: AuthListener[] = [];
  private initialized = false;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    if (this.initialized) return;
    this.initialized = true;

    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
          storage: AsyncStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      });
    }

    await this.loadStoredUser();
  }

  private async loadStoredUser() {
    try {
      const stored = await AsyncStorage.getItem(AUTH_USER_KEY);
      if (stored) {
        this.currentUser = JSON.parse(stored);
        this.notifyListeners();
      }
    } catch (e) {
      console.log('[Auth] Failed to load stored user:', e);
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentUser));
  }

  onAuthStateChange(callback: AuthListener): { unsubscribe: () => void } {
    this.listeners.push(callback);
    callback(this.currentUser);
    return {
      unsubscribe: () => {
        this.listeners = this.listeners.filter(l => l !== callback);
      }
    };
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  async getSession(): Promise<{ session: AuthUser | null }> {
    await this.initialize();
    return { session: this.currentUser };
  }

  getClient(): SupabaseClientType | null {
    return this.supabase;
  }

  async signUp(credentials: { email: string; password: string }): Promise<AuthResponse> {
    if (!supabaseUrl || !supabaseKey) {
      return { data: null, error: { message: 'Supabase not configured' } };
    }

    try {
      console.log('[Auth] SignUp: Creating account via axios...');
      
      const response = await axios.post(
        `${supabaseUrl}/auth/v1/signup`,
        {
          email: credentials.email.trim(),
          password: credentials.password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
          },
          timeout: 30000,
        }
      );

      console.log('[Auth] SignUp Success:', response.status);
      return { data: { user: null, session: null }, error: null };
    } catch (e: any) {
      const errorMsg = e.response?.data?.error_description || e.response?.data?.msg || e.message || 'Sign up failed';
      console.log('[Auth] SignUp Failed:', errorMsg);
      return { data: null, error: { message: errorMsg } };
    }
  }

  async signIn(credentials: { email: string; password: string }): Promise<AuthResponse> {
    if (!supabaseUrl || !supabaseKey) {
      console.log('[Auth] Config Error: Supabase not configured');
      return { data: null, error: { message: 'Supabase not configured' } };
    }

    try {
      console.log('[Auth] SignIn: Logging in via axios as', credentials.email);
      
      const response = await axios.post(
        `${supabaseUrl}/auth/v1/token?grant_type=password`,
        {
          email: credentials.email.trim(),
          password: credentials.password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
          },
          timeout: 30000,
        }
      );

      const data = response.data;
      
      if (data.access_token) {
        const user: AuthUser = {
          id: data.user?.id || '',
          email: credentials.email,
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        };

        await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
        this.currentUser = user;
        this.notifyListeners();

        console.log('[Auth] Success: Logged in successfully via axios');
        return { data: { user, session: user }, error: null };
      }

      return { data: null, error: { message: 'No access token returned' } };
    } catch (e: any) {
      const errorMsg = e.response?.data?.error_description || e.response?.data?.msg || e.message || 'Login failed';
      console.log('[Auth] Login Failed:', errorMsg);
      return { data: null, error: { message: errorMsg } };
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

  async refreshSession(): Promise<void> {
    if (!supabaseUrl || !supabaseKey || !this.currentUser?.refresh_token) {
      return;
    }

    try {
      const response = await axios.post(
        `${supabaseUrl}/auth/v1/token?grant_type=refresh_token`,
        {
          refresh_token: this.currentUser.refresh_token,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
          },
          timeout: 30000,
        }
      );

      const data = response.data;
      if (data.access_token) {
        this.currentUser = {
          id: data.user?.id || this.currentUser.id,
          email: data.user?.email || this.currentUser.email,
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        };
        await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(this.currentUser));
        this.notifyListeners();
      }
    } catch (e) {
      console.log('[Auth] Refresh failed:', e);
    }
  }
}

export const SupabaseClient = new SupabaseClientWrapper();
