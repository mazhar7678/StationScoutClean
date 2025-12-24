import { useQuery } from '@tanstack/react-query';

import { syncService } from '@data/data_sources/SyncService';

export function useSyncService() {
  return useQuery({
    queryKey: ['initial-sync'],
    queryFn: () => syncService.syncAll(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
