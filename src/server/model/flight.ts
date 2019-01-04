import Segment from "./segment";
import { duration, formatDuration } from "../utils/date";
import IFlight from "../../shared/IFlight";
import { db } from "../db";

export default class Flight implements IFlight {
  id: string;
  plane: string;
  startDate: Date;
  endDate?: Date;
  flightTime: number = 0;
  segment: Segment;
  duration: number;
  raw: object[];

  constructor(id: string, plane: string, startDate: Date) {
    this.id = id;
    this.plane = plane;
    this.startDate = startDate;
  }

  startTimer(now: Date, flying: Boolean) {
    if (this.segment) {
      this.segment.update(now);
    } else if (flying) {
      this.segment = new Segment(now);
    }
  }

  stopTimer(now?: Date) {
    if (this.segment) {
      if (now) {
        this.segment.update(now);
      }

      this.flightTime += this.segment.duration;

      console.log(`${this.segment}`);

      this.endDate = this.segment.end;
      this.duration = duration(this.startDate, this.endDate);

      this.segment = undefined;
    }
  }

  endSession(now?: Date) {
    this.stopTimer(now);

    console.log(this.toString());

    return this;
  }

  static list(): Promise<Flight[]> {
    return db.manyOrNone(
      "SELECT id, plane, startDate, endDate,  duration, flightTime " +
        "FROM flights " +
        "ORDER BY startDate desc"
    );
  }

  static find(id: string): Promise<Flight> {
    return db.oneOrNone("SELECT * FROM flights" + "WHERE id = $1", id);
  }

  save(): Promise<Flight> {
    return db.one(
      "INSERT INTO flights (id, plane, startDate, endDate,  duration, flightTime, raw) " +
        "VALUES (${id}, ${plane}, ${startDate}, ${endDate}, ${duration}, ${flightTime}, ${raw:json}) " +
        "ON CONFLICT (id) DO UPDATE SET " +
        " plane = ${plane}," +
        " startDate = ${startDate}," +
        " endDate = ${endDate}," +
        " duration = ${duration}," +
        " flightTime = ${flightTime}," +
        " raw = ${raw:json} " +
        "RETURNING *",
      this
    );
  }

  toString() {
    return `fly session ${this.id} [
        log start ${this.startDate}
        log end ${this.endDate}
        log duration ${formatDuration(this.duration)}
        flight duration ${formatDuration(this.flightTime)}
]`;
  }
}
