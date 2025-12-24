// App.tsx
import { DatabaseProvider } from '@nozbe/watermelondb/react';
import React from 'react';
import { PaperProvider } from 'react-native-paper';
import { database } from './src/data/data_sources/offline_database';

// ** THIS IS THE FIX **
// The path now correctly points to the file's real location.
import AppNavigator from './src/presentation/navigation/AppNavigator';

export default function App() {
  return (
    <DatabaseProvider database={database}>
      <PaperProvider>
        <AppNavigator />
      </PaperProvider>
    </DatabaseProvider>
  );
}