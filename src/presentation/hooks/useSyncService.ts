import { useMutation } from '@tanstack/react-query';
import { syncService } from '../../data/data_sources/SyncService';

export function useSyncService() {
  const syncMutation = useMutation({
    mutationFn: () => syncService.syncAll(),
    onError: (error) => {
      console.error('[useSyncService] Sync failed:', error);
    },
    onSuccess: () => {
      console.log('[useSyncService] Sync completed successfully');
    },
  });

  return {
    sync: syncMutation.mutate,
    syncAsync: syncMutation.mutateAsync,
    isSyncing: syncMutation.isPending,
    error: syncMutation.error,
    isSuccess: syncMutation.isSuccess,
  };
}
