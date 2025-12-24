// src/data/store/authStore.ts
import { create } from 'zustand';
import { Session } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  isLoading: boolean;
  setSession: (session: Session | null) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isLoading: true,
  setSession: (session) => set({ session }),
  // THIS IS THE FIX: Changed 'isLoading' to 'loading' to match the function parameter
  setIsLoading: (loading) => set({ isLoading: loading }), 
}));