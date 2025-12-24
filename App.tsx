import { DatabaseProvider } from '@nozbe/watermelondb/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { PaperProvider } from 'react-native-paper';
import { database } from './src/data/data_sources/offline_database';
import AppNavigator from './src/presentation/navigation/AppNavigator';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DatabaseProvider database={database}>
        <PaperProvider>
          <AppNavigator />
        </PaperProvider>
      </DatabaseProvider>
    </QueryClientProvider>
  );
}
