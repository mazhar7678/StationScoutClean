import { UserProfile } from '@domain/entities/userProfile';

export type UserProfileRepository = {
  fetchProfile: (userId: string) => Promise<UserProfile | null>;
};

type FetchUserProfileDeps = {
  repository: UserProfileRepository;
};

export async function fetchUserProfile(
  userId: string,
  { repository }: FetchUserProfileDeps,
): Promise<UserProfile | null> {
  if (!userId) {
    throw new Error('userId is required');
  }

  return repository.fetchProfile(userId);
}
