// src/data/data_sources/supabase_client.ts

import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SignInWithPasswordCredentials,
  SignUpWithPasswordCredentials,
  SupabaseClient as SupabaseClientType,
  createClient,
} from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

// Fix for Hermes "Cannot assign to read-only property 'NONE'" error
if (Platform.OS !== 'web' && typeof global !== 'undefined') {
  // Patch AbortSignal if it has frozen properties
  if (global.AbortSignal) {
    const origSignal = global.AbortSignal;
    try {
      // Test if NONE is writable
      const testSignal = new origSignal();
      if (testSignal && Object.isFrozen(testSignal)) {
        // Create a wrapper that doesn't freeze
        const PatchedAbortSignal = function() {
          return Object.create(origSignal.prototype);
        };
        PatchedAbortSignal.prototype = origSignal.prototype;
        (global as any).AbortSignal = PatchedAbortSignal;
      }
    } catch (e) {
      // Ignore patching errors
    }
  }
}

class SupabaseClientService {
  private readonly supabase: SupabaseClientType;

  constructor() {
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase URL or Anon Key is missing. Make sure it's in your .env file and prefixed with EXPO_PUBLIC_");
    }

    this.supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        flowType: 'pkce',
      },
      global: {
        headers: {
          'x-application-name': 'StationScoutMobile',
        },
      },
    });

    // Handle app state changes for token refresh (Android native fix)
    if (Platform.OS !== 'web') {
      AppState.addEventListener('change', (state) => {
        if (state === 'active') {
          this.supabase.auth.startAutoRefresh();
        } else {
          this.supabase.auth.stopAutoRefresh();
        }
      });
    }
  }

  get client() {
    return this.supabase;
  }

  async signUp(credentials: SignUpWithPasswordCredentials) {
    try {
      const result = await this.supabase.auth.signUp(credentials);
      return result;
    } catch (error: any) {
      console.error('[SupabaseClient] SignUp error:', error);
      return { data: null, error: { message: error?.message || 'Sign up failed' } };
    }
  }

  async signIn(credentials: SignInWithPasswordCredentials) {
    try {
      const result = await this.supabase.auth.signInWithPassword(credentials);
      return result;
    } catch (error: any) {
      console.error('[SupabaseClient] SignIn error:', error);
      return { data: null, error: { message: error?.message || 'Sign in failed' } };
    }
  }

  async signOut() {
    try {
      const result = await this.supabase.auth.signOut();
      return result;
    } catch (error: any) {
      console.error('[SupabaseClient] SignOut error:', error);
      return { error: { message: error?.message || 'Sign out failed' } };
    }
  }
}

export const SupabaseClient = new SupabaseClientService();