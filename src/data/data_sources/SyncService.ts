// src/data/data_sources/SyncService.ts

import { SupabaseClient } from './supabase_client';
import { database } from './offline_database'; 
import { Event } from '../db/models';

export async function syncEvents() {
  try {
    console.log('[SyncService] Starting event sync...');

    const eventsCollection = database.get<Event>('events');
    const { data: supabaseEvents, error } = await SupabaseClient.client.from('events').select('*');

    if (error) {
      console.error('[SyncService] Error fetching events from Supabase:', error);
      return;
    }
    if (!supabaseEvents || supabaseEvents.length === 0) {
      console.log('[SyncService] No events found in Supabase to sync.');
      return;
    }

    const preparedRecords = supabaseEvents.map(event => {
      let latitude = null;
      let longitude = null;
      if (event.location && typeof event.location === 'string') {
        const coordinates = event.location.replace('POINT(', '').replace(')', '').split(' ');
        if (coordinates.length === 2) {
          longitude = parseFloat(coordinates[0]);
          latitude = parseFloat(coordinates[1]);
        }
      }

      return eventsCollection.prepareCreate((record: Event) => {
        record._raw.id = event.source_id;
        record.sourceId = event.source_id;
        record.name = event.name;
        record.url = event.url;
        record.startDate = event.start_date;
        record.venueName = event.venue_name;
        record.venueAddress = event.venue_address;
        record.source = event.source;
        // ** THIS IS THE FIX **
        // Convert 'null' to 'undefined' to match the model's type definition.
        record.latitude = latitude === null ? undefined : latitude;
        record.longitude = longitude === null ? undefined : longitude;
      });
    });

    await database.write(async () => {
      await database.batch(preparedRecords);
    });

    console.log(`[SyncService] Event sync completed. ${preparedRecords.length} records processed.`);
  } catch (e) {
    console.error('[SyncService] An unexpected error occurred during sync:', e);
  }
}