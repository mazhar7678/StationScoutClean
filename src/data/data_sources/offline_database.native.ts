import { Platform } from 'react-native';
import { Database } from '@nozbe/watermelondb';
import { setGenerator } from '@nozbe/watermelondb/utils/common/randomId';
import * as Crypto from 'expo-crypto';

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

function createAdapter() {
  console.log(`[Database] Platform: ${Platform.OS}, attempting SQLite first...`);
  
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
    console.log('[Database] Falling back to LokiJS adapter...');
    
    const originalFreeze = Object.freeze;
    Object.freeze = function(obj: any) {
      if (obj && typeof obj === 'object') {
        try {
          const keys = Object.keys(obj);
          if (
            keys.includes('NONE') && 
            keys.includes('BUBBLE') && 
            keys.includes('CAPTURE')
          ) {
            return obj;
          }
        } catch (e) {}
      }
      return originalFreeze.call(Object, obj);
    };
    
    const originalError = console.error;
    console.error = (...args: any[]) => {
      const message = args[0]?.toString?.() || '';
      if (message.includes("read-only property")) {
        return;
      }
      originalError.apply(console, args);
    };
    
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

export const database = new Database({
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

export const offlineDatabase = database;
