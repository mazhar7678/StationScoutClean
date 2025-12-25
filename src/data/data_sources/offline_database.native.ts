import { Database } from '@nozbe/watermelondb';
import { setGenerator } from '@nozbe/watermelondb/utils/common/randomId';
import * as Crypto from 'expo-crypto';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

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

const adapter = new SQLiteAdapter({
  schema: stationScoutSchema,
  migrations,
  dbName: 'stationscout',
  jsi: true,
  onSetUpError: (error: any) => {
    console.error('Database setup error:', error);
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
