import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export class Event extends Model {
  static table = 'events';

  @field('source_id') sourceId: any;
  @field('name') name: any;
  @field('url') url: any;
  @field('start_date') startDate: any;
  @field('venue_name') venueName: any;
  @field('venue_address') venueAddress: any;
  @field('source') source: any;
  @field('latitude') latitude: any;
  @field('longitude') longitude: any;
  @readonly @date('created_at') createdAt: any;
  @readonly @date('updated_at') updatedAt: any;
}

export class TrainOperator extends Model {
  static table = 'train_operators';

  @field('name') name: any;
  @field('country') country: any;
  @field('logo_url') logoUrl: any;
  @readonly @date('updated_at') updatedAt: any;
}

export class RailwayLine extends Model {
  static table = 'railway_lines';

  @field('operator_id') operatorId: any;
  @field('name') name: any;
  @field('code') code: any;
  @field('color') color: any;
  @readonly @date('updated_at') updatedAt: any;
}

export class Station extends Model {
  static table = 'stations';

  @field('line_id') lineId: any;
  @field('name') name: any;
  @field('code') code: any;
  @field('latitude') latitude: any;
  @field('longitude') longitude: any;
  @readonly @date('updated_at') updatedAt: any;
}

export class Bookmark extends Model {
  static table = 'bookmarks';

  @field('event_id') eventId: any;
  @readonly @date('created_at') createdAt: any;
}

export class PendingChange extends Model {
  static table = 'pending_changes';

  @field('entity') entity: any;
  @field('entity_id') entityId: any;
  @field('operation') operation: any;
  @field('payload') payload: any;
  @readonly @date('created_at') createdAt: any;
}

export type EventRecord = Event;
