import { Model } from '@nozbe/watermelondb';

export class Event extends Model {
  static table = 'events';

  get sourceId(): string {
    return this._getRaw('source_id') as string;
  }
  set sourceId(value: string) {
    this._setRaw('source_id', value);
  }

  get name(): string {
    return this._getRaw('name') as string;
  }
  set name(value: string) {
    this._setRaw('name', value);
  }

  get url(): string {
    return this._getRaw('url') as string;
  }
  set url(value: string) {
    this._setRaw('url', value);
  }

  get startDate(): string | null {
    return this._getRaw('start_date') as string | null;
  }
  set startDate(value: string | null) {
    this._setRaw('start_date', value);
  }

  get venueName(): string | null {
    return this._getRaw('venue_name') as string | null;
  }
  set venueName(value: string | null) {
    this._setRaw('venue_name', value);
  }

  get venueAddress(): string | null {
    return this._getRaw('venue_address') as string | null;
  }
  set venueAddress(value: string | null) {
    this._setRaw('venue_address', value);
  }

  get source(): string {
    return this._getRaw('source') as string;
  }
  set source(value: string) {
    this._setRaw('source', value);
  }

  get latitude(): number | null {
    return this._getRaw('latitude') as number | null;
  }
  set latitude(value: number | null | undefined) {
    this._setRaw('latitude', value ?? null);
  }

  get longitude(): number | null {
    return this._getRaw('longitude') as number | null;
  }
  set longitude(value: number | null | undefined) {
    this._setRaw('longitude', value ?? null);
  }

  get createdAt(): number {
    return this._getRaw('created_at') as number;
  }

  get updatedAt(): number {
    return this._getRaw('updated_at') as number;
  }
}

export class TrainOperator extends Model {
  static table = 'train_operators';

  get name(): string {
    return this._getRaw('name') as string;
  }
  set name(value: string) {
    this._setRaw('name', value);
  }

  get country(): string | null {
    return this._getRaw('country') as string | null;
  }
  set country(value: string | null) {
    this._setRaw('country', value);
  }

  get logoUrl(): string | null {
    return this._getRaw('logo_url') as string | null;
  }
  set logoUrl(value: string | null) {
    this._setRaw('logo_url', value);
  }

  get updatedAt(): number {
    return this._getRaw('updated_at') as number;
  }
}

export class RailwayLine extends Model {
  static table = 'railway_lines';

  get operatorId(): string {
    return this._getRaw('operator_id') as string;
  }
  set operatorId(value: string) {
    this._setRaw('operator_id', value);
  }

  get name(): string {
    return this._getRaw('name') as string;
  }
  set name(value: string) {
    this._setRaw('name', value);
  }

  get code(): string | null {
    return this._getRaw('code') as string | null;
  }
  set code(value: string | null) {
    this._setRaw('code', value);
  }

  get color(): string | null {
    return this._getRaw('color') as string | null;
  }
  set color(value: string | null) {
    this._setRaw('color', value);
  }

  get updatedAt(): number {
    return this._getRaw('updated_at') as number;
  }
}

export class Station extends Model {
  static table = 'stations';

  get lineId(): string {
    return this._getRaw('line_id') as string;
  }
  set lineId(value: string) {
    this._setRaw('line_id', value);
  }

  get name(): string {
    return this._getRaw('name') as string;
  }
  set name(value: string) {
    this._setRaw('name', value);
  }

  get code(): string | null {
    return this._getRaw('code') as string | null;
  }
  set code(value: string | null) {
    this._setRaw('code', value);
  }

  get latitude(): number {
    return this._getRaw('latitude') as number;
  }
  set latitude(value: number) {
    this._setRaw('latitude', value);
  }

  get longitude(): number {
    return this._getRaw('longitude') as number;
  }
  set longitude(value: number) {
    this._setRaw('longitude', value);
  }

  get updatedAt(): number {
    return this._getRaw('updated_at') as number;
  }
}

export class Bookmark extends Model {
  static table = 'bookmarks';

  get eventId(): string {
    return this._getRaw('event_id') as string;
  }
  set eventId(value: string) {
    this._setRaw('event_id', value);
  }

  get createdAt(): number {
    return this._getRaw('created_at') as number;
  }
}

export class PendingChange extends Model {
  static table = 'pending_changes';

  get entity(): string {
    return this._getRaw('entity') as string;
  }
  set entity(value: string) {
    this._setRaw('entity', value);
  }

  get entityId(): string {
    return this._getRaw('entity_id') as string;
  }
  set entityId(value: string) {
    this._setRaw('entity_id', value);
  }

  get operation(): string {
    return this._getRaw('operation') as string;
  }
  set operation(value: string) {
    this._setRaw('operation', value);
  }

  get payload(): string | null {
    return this._getRaw('payload') as string | null;
  }
  set payload(value: string | null) {
    this._setRaw('payload', value);
  }

  get createdAt(): number {
    return this._getRaw('created_at') as number;
  }
}

export type EventRecord = Event;
