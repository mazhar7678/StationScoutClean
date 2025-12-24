import { SupabaseClient } from '@data/data_sources/supabase_client';
import { UserProfile } from '@domain/entities/userProfile';
import { UserProfileRepository } from '@domain/use_cases/fetchUserProfile';

type UserProfileRow = {
  id: string;
  display_name: string;
  email: string;
};

export const userRepository: UserProfileRepository = {
  async fetchProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await SupabaseClient.client
      .from('user_profiles')
      .select('id, display_name, email')
      .eq('id', userId)
      .maybeSingle<UserProfileRow>();

    if (error) {
      throw error;
    }

    if (!data) {
      return null;
    }

    return {
      id: data.id,
      displayName: data.display_name,
      email: data.email,
    };
  },
};
