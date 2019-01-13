import Segment, { SegmentType } from "./segment";
import { durationInSeconds, formatDuration } from "../../shared/utils/date";
import { Flight as IFlight, FlightDay } from "../../shared/flights/types";
import { db } from "../db";

export default class Flight implements IFlight {
  id: string;
  plane: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  armedTime: number;
  flightTime: number;
  segments: Segment[];

  constructor(id: string, plane: string, segments: Segment[]) {
    this.id = id;
    this.plane = plane;
    this.segments = segments;
    this.startDate = segments[0].startDate;
    this.endDate = segments[segments.length - 1].endDate;
    this.duration = durationInSeconds(this.startDate, this.endDate);

    this.armedTime = this.segments
      .filter(segment => segment.type !== SegmentType.stopped)
      .reduce((sum, segment) => sum + segment.duration, 0);

    this.flightTime = this.segments
      .filter(segment => segment.type === SegmentType.flying)
      .reduce((sum, segment) => sum + segment.duration, 0);
  }

  static list(): Promise<FlightDay[]> {
    return db.manyOrNone(
      "SELECT string_agg(distinct plane, ', ' ORDER BY plane) as planes, " +
        " sum(duration) as duration, sum(armed_time) as armed_time, sum(flight_time) as flight_time, " +
        " to_char(start_date, 'YYYY-MM-DD') as date, count(*) as flights " +
        "FROM flights " +
        "GROUP BY date " +
        "ORDER BY date desc"
    );
  }

  static listByDay(day: Date): Promise<Flight[]> {
    return db.manyOrNone(
      "SELECT id, plane, start_date, end_date, " +
        " duration, armed_time, flight_time " +
        "FROM flights " +
        "WHERE start_date::date = $1" +
        "ORDER BY start_date desc",
      day
    );
  }

  static find(id: string): Promise<Flight> {
    return db.oneOrNone("SELECT * FROM flights WHERE id = $1", id);
  }

  static delete(id: string): Promise<Flight> {
    return db.none("DELETE FROM flights WHERE id = $1", id);
  }

  save(): Promise<Flight> {
    return db.one(
      "INSERT INTO flights (id, plane, start_date, end_date,  duration, armed_time, flight_time, segments) " +
        "VALUES (${id}, ${plane}, ${startDate}, ${endDate}, ${duration}, ${armedTime}, ${flightTime}, ${segments:json}) " +
        "ON CONFLICT (id) DO UPDATE SET " +
        " plane = ${plane}," +
        " start_date = ${startDate}," +
        " end_date = ${endDate}," +
        " duration = ${duration}," +
        " armed_time = ${armedTime}," +
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
        armed time ${formatDuration(this.armedTime)}
        flight time ${formatDuration(this.flightTime)}
]`;
  }
}
