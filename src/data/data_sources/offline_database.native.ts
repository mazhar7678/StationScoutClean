import { Platform } from 'react-native';
import { Database } from '@nozbe/watermelondb';
import { setGenerator } from '@nozbe/watermelondb/utils/common/randomId';
import * as Crypto from 'expo-crypto';
import Constants from 'expo-constants';

import { stationScoutSchema } from '../db/schema';
import { migrations } from '../db/migrations';
import {
  Event,
  TrainOperator,
  RailwayLine,
  Station,
  Bookmark,
  PendingChange,
} from '../db/models';

setGenerator(() => Crypto.randomUUID());

const isExpoGo = (): boolean => {
  try {
    return Constants.appOwnership === 'expo';
  } catch {
    return false;
  }
};

const isHermes = (): boolean => {
  return typeof (global as any).HermesInternal !== 'undefined';
};

class MockDatabase {
  get<T>(tableName: string): any {
    return {
      query: () => ({
        fetch: async () => [],
        observe: () => ({ subscribe: (cb: any) => { cb([]); return { unsubscribe: () => {} }; } }),
      }),
      find: async () => null,
      create: async (callback: any) => {
        const record: any = { id: Crypto.randomUUID() };
        if (callback) callback(record);
        return record;
      },
    };
  }
  
  write<T>(callback: () => Promise<T>): Promise<T> {
    return callback();
  }
  
  batch(...records: any[]): Promise<void> {
    return Promise.resolve();
  }

  adapter = { schema: stationScoutSchema };
}

function createAdapter() {
  console.log(`[Database] Platform: ${Platform.OS}, Hermes: ${isHermes()}, ExpoGo: ${isExpoGo()}`);
  
  if (Platform.OS === 'android' && isHermes() && isExpoGo()) {
    console.warn(
      '[Database] Running in Expo Go on Android/Hermes - using mock database.\n' +
      'Data will NOT persist. Use EAS Build for full functionality.'
    );
    return null;
  }
  
  console.log('[Database] Attempting SQLite adapter...');
  
  try {
    const SQLiteAdapter = require('@nozbe/watermelondb/adapters/sqlite').default;
    console.log('[Database] SQLite adapter loaded successfully');
    
    const adapter = new SQLiteAdapter({
      schema: stationScoutSchema,
      migrations,
      dbName: 'stationscout',
      jsi: true,
      onSetUpError: (error: any) => {
        console.error('[Database] SQLite setup error:', error);
      },
    });
    
    console.log('[Database] Using SQLite adapter');
    return adapter;
  } catch (sqliteError) {
    console.warn('[Database] SQLite not available:', sqliteError);
    
    if (Platform.OS === 'android' && isHermes()) {
      console.warn('[Database] Using mock database due to Hermes compatibility');
      return null;
    }
    
    console.log('[Database] Falling back to LokiJS adapter...');
    
    const LokiJSAdapter = require('@nozbe/watermelondb/adapters/lokijs').default;
    
    return new LokiJSAdapter({
      schema: stationScoutSchema,
      useWebWorker: false,
      useIncrementalIndexedDB: false,
      dbName: 'stationscout_native_fallback_v4',
      onQuotaExceededError: (error: any) => {
        console.warn('Storage quota exceeded:', error);
      },
    });
  }
}

const adapter = createAdapter();

let database: any;

if (adapter === null) {
  console.log('[Database] Using MockDatabase');
  database = new MockDatabase();
} else {
  database = new Database({
    adapter,
    modelClasses: [
      Event,
      TrainOperator,
      RailwayLine,
      Station,
      Bookmark,
      PendingChange,
    ],
  });
}

export { database };
export const offlineDatabase = database;
