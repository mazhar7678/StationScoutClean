// src/data/store/authStore.ts
import { create } from 'zustand';
import { AuthUser } from '../data_sources/supabase_client';

interface AuthState {
  session: AuthUser | null;
  isLoading: boolean;
  setSession: (session: AuthUser | null) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isLoading: true,
  setSession: (session) => set({ session }),
  setIsLoading: (loading) => set({ isLoading: loading }), 
}));