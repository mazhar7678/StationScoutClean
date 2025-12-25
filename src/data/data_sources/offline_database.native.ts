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

if (Platform.OS === 'android' && isHermes()) {
  const originalError = console.error;
  console.error = (...args: any[]) => {
    const message = args[0]?.toString?.() || '';
    if (
      message.includes("Cannot assign to read-only property 'NONE'") ||
      message.includes("Cannot assign to read-only property 'BUBBLE'") ||
      message.includes("Cannot assign to read-only property 'CAPTURE'") ||
      message.includes("read-only property")
    ) {
      return;
    }
    originalError.apply(console, args);
  };
}

function createAdapter() {
  if (isExpoGo()) {
    console.log('[Database] Expo Go detected - using LokiJS adapter');
    const LokiJSAdapter = require('@nozbe/watermelondb/adapters/lokijs').default;
    
    return new LokiJSAdapter({
      schema: stationScoutSchema,
      useWebWorker: false,
      useIncrementalIndexedDB: false,
      dbName: 'stationscout_expogo_v3',
      onQuotaExceededError: (error: any) => {
        console.warn('Storage quota exceeded:', error);
      },
    });
  }

  try {
    const SQLiteAdapter = require('@nozbe/watermelondb/adapters/sqlite').default;
    console.log('[Database] Using SQLite adapter for production build');
    
    return new SQLiteAdapter({
      schema: stationScoutSchema,
      migrations,
      dbName: 'stationscout',
      jsi: true,
      onSetUpError: (error: any) => {
        console.error('SQLite setup error:', error);
      },
    });
  } catch (error) {
    console.warn('[Database] SQLite not available, falling back to LokiJS');
    const LokiJSAdapter = require('@nozbe/watermelondb/adapters/lokijs').default;
    
    return new LokiJSAdapter({
      schema: stationScoutSchema,
      useWebWorker: false,
      useIncrementalIndexedDB: false,
      dbName: 'stationscout_fallback_v3',
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
