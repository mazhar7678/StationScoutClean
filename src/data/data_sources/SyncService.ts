import { SupabaseClient } from './supabase_client';
import { database } from './offline_database';
import { Event, TrainOperator, RailwayLine, Station } from '../db/models';

function isSupabaseReady(): boolean {
  try {
    return SupabaseClient.client !== undefined;
  } catch {
    return false;
  }
}

export async function syncEvents(): Promise<void> {
  if (!isSupabaseReady()) {
    console.log('[SyncService] Supabase not configured, skipping event sync');
    return;
  }

  try {
    console.log('[SyncService] Starting event sync...');

    const eventsCollection = database.get<Event>('events');
    const { data: supabaseEvents, error } = await SupabaseClient.client.from('events').select('*');

    if (error) {
      console.error('[SyncService] Error fetching events from Supabase:', error.message);
      return;
    }
    if (!supabaseEvents || supabaseEvents.length === 0) {
      console.log('[SyncService] No events found in Supabase to sync.');
      return;
    }

    await database.write(async () => {
      const existing = await eventsCollection.query().fetch();
      await database.batch(...existing.map(r => r.prepareDestroyPermanently()));
    });

    await database.write(async () => {
      const preparedRecords = supabaseEvents.map(event => {
        let latitude: number | undefined;
        let longitude: number | undefined;
        if (event.location && typeof event.location === 'string') {
          const coordinates = event.location.replace('POINT(', '').replace(')', '').split(' ');
          if (coordinates.length === 2) {
            longitude = parseFloat(coordinates[0]);
            latitude = parseFloat(coordinates[1]);
          }
        }

        return eventsCollection.prepareCreate((record: Event) => {
          record._raw.id = event.source_id || event.id;
          record._raw.source_id = event.source_id || event.id;
          record._raw.name = event.name || 'Unnamed Event';
          record._raw.url = event.url || '';
          record._raw.start_date = event.start_date || null;
          record._raw.venue_name = event.venue_name || null;
          record._raw.venue_address = event.venue_address || null;
          record._raw.source = event.source || 'unknown';
          record._raw.latitude = latitude ?? null;
          record._raw.longitude = longitude ?? null;
          record._raw.created_at = Date.now();
          record._raw.updated_at = Date.now();
        });
      });

      await database.batch(...preparedRecords);
    });

    console.log(`[SyncService] Event sync completed. ${supabaseEvents.length} records processed.`);
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    console.error('[SyncService] Event sync error:', errorMessage);
  }
}

export async function syncOperators(): Promise<void> {
  if (!isSupabaseReady()) {
    console.log('[SyncService] Supabase not configured, skipping operator sync');
    return;
  }

  try {
    console.log('[SyncService] Starting operator sync...');
    const collection = database.get<TrainOperator>('train_operators');
    const { data, error } = await SupabaseClient.client.from('train_operators').select('*');

    if (error) {
      console.error('[SyncService] Error fetching operators:', error.message);
      return;
    }
    if (!data || data.length === 0) {
      console.log('[SyncService] No operators found.');
      return;
    }

    await database.write(async () => {
      const existing = await collection.query().fetch();
      await database.batch(...existing.map(r => r.prepareDestroyPermanently()));
    });

    await database.write(async () => {
      const records = data.map(item =>
        collection.prepareCreate((record: TrainOperator) => {
          record._raw.id = item.id;
          record._raw.name = item.name || '';
          record._raw.country = item.country || null;
          record._raw.logo_url = item.logo_url || null;
          record._raw.updated_at = Date.now();
        })
      );
      await database.batch(...records);
    });

    console.log(`[SyncService] Operator sync completed. ${data.length} records.`);
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    console.error('[SyncService] Operator sync error:', errorMessage);
  }
}

export async function syncLines(): Promise<void> {
  if (!isSupabaseReady()) {
    console.log('[SyncService] Supabase not configured, skipping line sync');
    return;
  }

  try {
    console.log('[SyncService] Starting line sync...');
    const collection = database.get<RailwayLine>('railway_lines');
    const { data, error } = await SupabaseClient.client.from('railway_lines').select('*');

    if (error) {
      console.error('[SyncService] Error fetching lines:', error.message);
      return;
    }
    if (!data || data.length === 0) {
      console.log('[SyncService] No lines found.');
      return;
    }

    await database.write(async () => {
      const existing = await collection.query().fetch();
      await database.batch(...existing.map(r => r.prepareDestroyPermanently()));
    });

    await database.write(async () => {
      const records = data.map(item =>
        collection.prepareCreate((record: RailwayLine) => {
          record._raw.id = item.id;
          record._raw.operator_id = item.operator_id;
          record._raw.name = item.name || '';
          record._raw.code = item.code || null;
          record._raw.color = item.color || null;
          record._raw.updated_at = Date.now();
        })
      );
      await database.batch(...records);
    });

    console.log(`[SyncService] Line sync completed. ${data.length} records.`);
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    console.error('[SyncService] Line sync error:', errorMessage);
  }
}

export async function syncStations(): Promise<void> {
  if (!isSupabaseReady()) {
    console.log('[SyncService] Supabase not configured, skipping station sync');
    return;
  }

  try {
    console.log('[SyncService] Starting station sync...');
    const collection = database.get<Station>('stations');
    const { data, error } = await SupabaseClient.client.from('stations').select('*');

    if (error) {
      console.error('[SyncService] Error fetching stations:', error.message);
      return;
    }
    if (!data || data.length === 0) {
      console.log('[SyncService] No stations found.');
      return;
    }

    await database.write(async () => {
      const existing = await collection.query().fetch();
      await database.batch(...existing.map(r => r.prepareDestroyPermanently()));
    });

    await database.write(async () => {
      const records = data.map(item =>
        collection.prepareCreate((record: Station) => {
          record._raw.id = item.id;
          record._raw.line_id = item.line_id;
          record._raw.name = item.name || '';
          record._raw.code = item.code || null;
          record._raw.latitude = item.latitude || 0;
          record._raw.longitude = item.longitude || 0;
          record._raw.updated_at = Date.now();
        })
      );
      await database.batch(...records);
    });

    console.log(`[SyncService] Station sync completed. ${data.length} records.`);
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    console.error('[SyncService] Station sync error:', errorMessage);
  }
}

export async function syncAll(): Promise<void> {
  console.log('[SyncService] Starting full sync...');
  try {
    await syncOperators();
    await syncLines();
    await syncStations();
    await syncEvents();
    console.log('[SyncService] Full sync completed.');
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    console.error('[SyncService] Full sync failed:', errorMessage);
  }
}

export const syncService = {
  syncEvents,
  syncOperators,
  syncLines,
  syncStations,
  syncAll,
};
