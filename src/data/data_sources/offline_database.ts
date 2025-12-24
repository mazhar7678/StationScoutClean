// src/data/data_sources/offline_database.ts
import { Database } from '@nozbe/watermelondb';
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs';
import { stationScoutSchema } from '../db/schema';

const adapter = new LokiJSAdapter({
  schema: stationScoutSchema,
  useWebWorker: false,
  useIncrementalIndexedDB: true,
  dbName: 'StationScoutDB',
});

export const database = new Database({
  adapter,
  modelClasses: [], // No model classes needed
});