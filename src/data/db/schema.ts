import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const stationScoutSchema = appSchema({
  version: 3,
  tables: [
    tableSchema({
      name: 'events',
      columns: [
        { name: 'source_id', type: 'string', isIndexed: true },
        { name: 'name', type: 'string' },
        { name: 'url', type: 'string' },
        { name: 'image_url', type: 'string', isOptional: true },
        { name: 'start_date', type: 'string', isOptional: true },
        { name: 'venue_name', type: 'string', isOptional: true },
        { name: 'venue_address', type: 'string', isOptional: true },
        { name: 'source', type: 'string' },
        { name: 'latitude', type: 'number', isOptional: true },
        { name: 'longitude', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),

    // --- Keeping your other tables as they were ---
    tableSchema({
      name: 'pending_changes',
      columns: [
        { name: 'entity', type: 'string' },
        { name: 'entity_id', type: 'string' },
        { name: 'operation', type: 'string' },
        { name: 'payload', type: 'string' },
        { name: 'created_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'train_operators',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'country', type: 'string', isOptional: true },
        { name: 'logo_url', type: 'string', isOptional: true },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'railway_lines',
      columns: [
        { name: 'operator_id', type: 'string', isIndexed: true },
        { name: 'name', type: 'string' },
        { name: 'code', type: 'string', isOptional: true },
        { name: 'color', type: 'string', isOptional: true },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'stations',
      columns: [
        { name: 'line_id', type: 'string', isIndexed: true },
        { name: 'name', type: 'string' },
        { name: 'code', type: 'string', isOptional: true },
        { name: 'latitude', type: 'number' },
        { name: 'longitude', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'bookmarks',
      columns: [
        { name: 'event_id', type: 'string', isIndexed: true },
        { name: 'created_at', type: 'number' },
      ],
    }),
  ],
});