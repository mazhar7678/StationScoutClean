import { Database } from '@nozbe/watermelondb';
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs';
import { stationScoutSchema } from '../db/schema';
import {
  Event,
  TrainOperator,
  RailwayLine,
  Station,
  Bookmark,
  PendingChange,
} from '../db/models';

const adapter = new LokiJSAdapter({
  schema: stationScoutSchema,
  useWebWorker: false,
  useIncrementalIndexedDB: true,
  dbName: 'StationScoutDB',
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
