import { createClient, SupabaseClient as SupabaseClientType } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

      this.supabase.auth.onAuthStateChange((event, session) => {
        console.log('[Auth] State changed:', event);
        if (session?.user) {
          this.currentUser = {
            id: session.user.id,
            email: session.user.email || '',
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          };
        } else {
          this.currentUser = null;
        }
        this.notifyListeners();
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
    if (!this.supabase) {
      return { data: null, error: { message: 'Supabase not configured' } };
    }

    try {
      console.log('[Auth] SignUp: Creating account...');
      
      const { data, error } = await this.supabase.auth.signUp({
        email: credentials.email.trim(),
        password: credentials.password,
      });

      if (error) {
        console.log('[Auth] SignUp Failed:', error.message);
        return { data: null, error: { message: error.message } };
      }

      console.log('[Auth] SignUp Success: Account created!');
      return { data: { user: null, session: null }, error: null };
    } catch (e: any) {
      console.log('[Auth] SignUp Exception:', e?.message);
      return { data: null, error: { message: e?.message || 'Unknown error' } };
    }
  }

  async signIn(credentials: { email: string; password: string }): Promise<AuthResponse> {
    if (!this.supabase) {
      console.log('[Auth] Config Error: Supabase not configured');
      return { data: null, error: { message: 'Supabase not configured' } };
    }

    try {
      console.log('[Auth] SignIn: Logging in as', credentials.email);
      
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: credentials.email.trim(),
        password: credentials.password,
      });

      if (error) {
        console.log('[Auth] Login Failed:', error.message);
        return { data: null, error: { message: error.message } };
      }

      if (data.session) {
        const user: AuthUser = {
          id: data.user?.id || '',
          email: credentials.email,
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        };

        await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
        this.currentUser = user;
        this.notifyListeners();

        console.log('[Auth] Success: Logged in successfully');
        return { data: { user, session: user }, error: null };
      }

      return { data: null, error: { message: 'No session returned' } };
    } catch (e: any) {
      console.log('[Auth] Login Exception:', e?.message);
      return { data: null, error: { message: e?.message || 'Unknown error' } };
    }
  }

  async signOut(): Promise<{ error: { message: string } | null }> {
    try {
      if (this.supabase) {
        await this.supabase.auth.signOut();
      }
      await AsyncStorage.removeItem(AUTH_USER_KEY);
      this.currentUser = null;
      this.notifyListeners();
      return { error: null };
    } catch (e: any) {
      return { error: { message: e?.message || 'Sign out failed' } };
    }
  }

  async refreshSession(): Promise<void> {
    if (this.supabase) {
      const { data } = await this.supabase.auth.refreshSession();
      if (data.session) {
        this.currentUser = {
          id: data.user?.id || '',
          email: data.user?.email || '',
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        };
        await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(this.currentUser));
        this.notifyListeners();
      }
    }
  }
}

export const SupabaseClient = new SupabaseClientWrapper();
