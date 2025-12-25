import { Database } from '@nozbe/watermelondb';
import { setGenerator } from '@nozbe/watermelondb/utils/common/randomId';
import * as Crypto from 'expo-crypto';
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs';

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

const adapter = new LokiJSAdapter({
  schema: stationScoutSchema,
  migrations,
  useWebWorker: false,
  useIncrementalIndexedDB: true,
  dbName: 'stationscout_web',
  onQuotaExceededError: (error: any) => {
    console.error('IndexedDB quota exceeded:', error);
  },
});

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
