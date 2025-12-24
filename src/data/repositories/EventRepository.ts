import { Q } from '@nozbe/watermelondb';
import { Collection, Database } from '@nozbe/watermelondb';

import {
  EventRecord,
  RailwayLine,
  Station,
  TrainOperator,
} from '@data/db/models';
import { offlineDatabase } from '@data/data_sources/offline_database';

export class EventRepository {
  private readonly operators: Collection<TrainOperator>;
  private readonly lines: Collection<RailwayLine>;
  private readonly stations: Collection<Station>;
  private readonly events: Collection<EventRecord>;

  constructor(private readonly database: Database = offlineDatabase) {
    this.operators =
      this.database.collections.get<TrainOperator>('train_operators');
    this.lines = this.database.collections.get<RailwayLine>('railway_lines');
    this.stations = this.database.collections.get<Station>('stations');
    this.events = this.database.collections.get<EventRecord>('events');
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
}
