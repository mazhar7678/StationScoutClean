import { Q } from '@nozbe/watermelondb';
import { Collection, Database } from '@nozbe/watermelondb';

import {
  Event,
  RailwayLine,
  Station,
  TrainOperator,
} from '../db/models';
import { database as offlineDatabase } from '../data_sources/offline_database';

export type EventRecord = Event;

export class EventRepository {
  private readonly operators: Collection<TrainOperator>;
  private readonly lines: Collection<RailwayLine>;
  private readonly stations: Collection<Station>;
  private readonly events: Collection<Event>;

  constructor(private readonly database: Database = offlineDatabase) {
    this.operators = this.database.get<TrainOperator>('train_operators');
    this.lines = this.database.get<RailwayLine>('railway_lines');
    this.stations = this.database.get<Station>('stations');
    this.events = this.database.get<Event>('events');
  }

  operatorsQuery() {
    return this.operators.query();
  }

  linesByOperator(operatorId: string) {
    return this.lines.query(Q.where('operator_id', operatorId));
  }

  stationsByLine(lineId: string) {
    return this.stations.query(Q.where('line_id', lineId));
  }

  stationById(stationId: string) {
    return this.stations.query(Q.where('id', stationId));
  }

  lineById(lineId: string) {
    return this.lines.query(Q.where('id', lineId));
  }

  eventsByStation(stationId: string) {
    return this.events.query(Q.where('station_id', stationId));
  }

  eventById(eventId: string) {
    return this.events.query(Q.where('id', eventId));
  }

  allEvents() {
    return this.events.query();
  }
}
