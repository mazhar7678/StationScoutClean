import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import { Buffer } from 'buffer';
global.Buffer = Buffer;

import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DatabaseProvider } from '@nozbe/watermelondb/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useEffect, useRef } from 'react';
import { AppState, AppStateStatus, StyleSheet } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { database } from './src/data/data_sources/offline_database';
import { syncService } from './src/data/data_sources/SyncService';
import AppNavigator from './src/presentation/navigation/AppNavigator';

const queryClient = new QueryClient();

const SYNC_INTERVAL_MS = 5 * 60 * 1000;

function AppContent() {
  const appState = useRef(AppState.currentState);
  const lastSyncTime = useRef<number>(0);

  useEffect(() => {
    const performSync = async () => {
      const now = Date.now();
      if (now - lastSyncTime.current > 60000) {
        console.log('[App] Performing automatic sync...');
        lastSyncTime.current = now;
        try {
          await syncService.syncAll();
        } catch (error) {
          console.error('[App] Auto-sync failed:', error);
        }
      }
    };

    performSync();

    const intervalId = setInterval(() => {
      if (appState.current === 'active') {
        performSync();
      }
    }, SYNC_INTERVAL_MS);

    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('[App] App came to foreground, syncing...');
        performSync();
      }
      appState.current = nextAppState;
    });

    return () => {
      clearInterval(intervalId);
      subscription.remove();
    };
  }, []);

  return <AppNavigator />;
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <QueryClientProvider client={queryClient}>
        <DatabaseProvider database={database}>
          <PaperProvider>
            <AppContent />
          </PaperProvider>
        </DatabaseProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
