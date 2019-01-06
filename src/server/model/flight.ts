import Segment, { SegmentType } from "./segment";
import { duration, formatDuration } from "../../shared/utils/date";
import IFlight from "../../shared/IFlight";
import { db } from "../db";

export default class Flight implements IFlight {
  id: string;
  plane: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  readyTime: number;
  flightTime: number;
  segments: Segment[];

  constructor(id: string, plane: string, segments: Segment[]) {
    this.id = id;
    this.plane = plane;
    this.segments = segments;
    this.startDate = segments[0].startDate;
    this.endDate = segments[segments.length - 1].endDate;
    this.duration = duration(this.startDate, this.endDate);

    this.readyTime = this.segments
      .filter(segment => segment.type === SegmentType.ready)
      .reduce((sum, segment) => sum + segment.duration, 0);

    this.flightTime = this.segments
      .filter(segment => segment.type === SegmentType.flying)
      .reduce((sum, segment) => sum + segment.duration, 0);
  }

  static list(): Promise<Flight[]> {
    return db.manyOrNone(
      "SELECT id, plane, start_date, end_date,  duration, ready_time, flight_time, segments " +
        "FROM flights " +
        "ORDER BY start_date desc"
    );
  }

  static find(id: string): Promise<Flight> {
    return db.oneOrNone("SELECT * FROM flights" + "WHERE id = $1", id);
  }

  save(): Promise<Flight> {
    return db.one(
      "INSERT INTO flights (id, plane, start_date, end_date,  duration, ready_time, flight_time, segments) " +
        "VALUES (${id}, ${plane}, ${startDate}, ${endDate}, ${duration}, ${readyTime}, ${flightTime}, ${segments:json}) " +
        "ON CONFLICT (id) DO UPDATE SET " +
        " plane = ${plane}," +
        " start_date = ${startDate}," +
        " end_date = ${endDate}," +
        " duration = ${duration}," +
        " ready_time = ${readyTime}," +
        " flight_time = ${flightTime}," +
        " segments = ${segments:json} " +
        "RETURNING *",
      this
    );
  }

  toString() {
    return `flight ${this.id} [
        flight start ${this.startDate}
        flight end ${this.endDate}
        duration ${formatDuration(this.duration)}
        ready time ${formatDuration(this.readyTime)}
        flight time ${formatDuration(this.flightTime)}
]`;
  }
}
