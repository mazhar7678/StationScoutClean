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
    const { data: supabaseEvents, error } = await SupabaseClient.client
      .from('events')
      .select('*')
      .limit(5000);

    if (error) {
      console.error('[SyncService] Error fetching events from Supabase:', error.message);
      return;
    }
    if (!supabaseEvents || supabaseEvents.length === 0) {
      console.log('[SyncService] No events found in Supabase to sync.');
      return;
    }
    
    if (supabaseEvents.length > 0) {
      console.log('[SyncService] Sample event fields:', Object.keys(supabaseEvents[0]));
      const sample = supabaseEvents[0];
      console.log('[SyncService] Sample event url:', sample.url);
      console.log('[SyncService] Sample event location:', sample.location);
      
      const sources = [...new Set(supabaseEvents.map((e: any) => e.source))];
      console.log('[SyncService] Event sources from Supabase:', sources);
      const ticketmasterCount = supabaseEvents.filter((e: any) => e.source === 'ticketmaster').length;
      console.log('[SyncService] Ticketmaster events in Supabase:', ticketmasterCount);
    }
    
    const eventsWithLocation = supabaseEvents.filter((e: any) => e.location);
    console.log('[SyncService] Events with location field:', eventsWithLocation.length, 'of', supabaseEvents.length);
    
    let parsedCount = 0;

    await database.write(async () => {
      const existing = await eventsCollection.query().fetch();
      await database.batch(...existing.map(r => r.prepareDestroyPermanently()));
    });

    await database.write(async () => {
      const hexToDouble = (hexStr: string): number => {
        const bytes = new Uint8Array(8);
        for (let i = 0; i < 8; i++) {
          bytes[i] = parseInt(hexStr.substr(i * 2, 2), 16);
        }
        const view = new DataView(bytes.buffer);
        return view.getFloat64(0, true);
      };

      const preparedRecords = supabaseEvents.map(event => {
        let latitude: number | null = null;
        let longitude: number | null = null;
        
        if (event.location && typeof event.location === 'string') {
          const loc = event.location;
          
          if (loc.startsWith('POINT(') || loc.startsWith('POINT (')) {
            const coordinates = loc.replace(/POINT\s*\(\s*/, '').replace(')', '').trim().split(/\s+/);
            if (coordinates.length === 2) {
              longitude = parseFloat(coordinates[0]);
              latitude = parseFloat(coordinates[1]);
            }
          } else if (/^[0-9a-fA-F]+$/.test(loc) && loc.length >= 50) {
            try {
              const lonHex = loc.substring(18, 34);
              const latHex = loc.substring(34, 50);
              longitude = hexToDouble(lonHex);
              latitude = hexToDouble(latHex);
              parsedCount++;
            } catch (e) {
              console.warn('Failed to parse location hex:', e);
            }
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
          record._raw.latitude = latitude;
          record._raw.longitude = longitude;
          record._raw.created_at = Date.now();
          record._raw.updated_at = Date.now();
        });
      });

      await database.batch(...preparedRecords);
    });

    console.log(`[SyncService] Event sync completed. ${supabaseEvents.length} records processed, ${parsedCount} with coordinates.`);
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
          record._raw.country = item.code || null;
          record._raw.logo_url = null;
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
          record._raw.operator_id = item.toc_id;
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
      const records = data.map(item => {
        let latitude = 0;
        let longitude = 0;
        if (item.location && typeof item.location === 'string') {
          const hex = item.location;
          if (hex.startsWith('0101000020E6100000')) {
            const coordHex = hex.substring(18);
            const lonHex = coordHex.substring(0, 16);
            const latHex = coordHex.substring(16, 32);
            try {
              const hexToDouble = (hexStr: string): number => {
                const bytes = new Uint8Array(8);
                for (let i = 0; i < 8; i++) {
                  bytes[i] = parseInt(hexStr.substr(i * 2, 2), 16);
                }
                const view = new DataView(bytes.buffer);
                return view.getFloat64(0, true);
              };
              longitude = hexToDouble(lonHex);
              latitude = hexToDouble(latHex);
            } catch (e) {
              console.warn('Failed to parse location hex:', e);
            }
          }
        }
        
        return collection.prepareCreate((record: Station) => {
          record._raw.id = item.id;
          record._raw.line_id = '';
          record._raw.name = item.name || '';
          record._raw.code = item.crs_code || null;
          record._raw.latitude = latitude;
          record._raw.longitude = longitude;
          record._raw.updated_at = Date.now();
        });
      });
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
