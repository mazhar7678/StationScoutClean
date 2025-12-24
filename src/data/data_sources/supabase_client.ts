// src/data/data_sources/supabase_client.ts

import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SignInWithPasswordCredentials,
  SignUpWithPasswordCredentials,
  SupabaseClient as SupabaseClientType,
  createClient,
} from '@supabase/supabase-js';

// No longer need to import from '@env'

class SupabaseClientService {
  private readonly supabase: SupabaseClientType;

  constructor() {
    // This is the Expo way to access environment variables
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
      },
      global: {
        headers: {
          'x-application-name': 'StationScoutMobile',
        },
      },
    });
  }

  get client() {
    return this.supabase;
  }

  signUp(credentials: SignUpWithPasswordCredentials) {
    return this.supabase.auth.signUp(credentials);
  }

  signIn(credentials: SignInWithPasswordCredentials) {
    return this.supabase.auth.signInWithPassword(credentials);
  }

  signOut() {
    return this.supabase.auth.signOut();
  }
}

export const SupabaseClient = new SupabaseClientService();