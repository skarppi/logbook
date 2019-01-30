import { formatDuration } from "../../shared/utils/date";
import { FlightDay, Flight } from "../../shared/flights/types";
import { db } from "../db";
import { readdirSync } from "fs";
import BatteryCycleRepository from "./batterycycle";
import { VIDEO_FOLDER } from "../config";

export default class FlightRepository {
  static enrich(flight: Flight) {
    return BatteryCycleRepository.listByFlight(flight.id).then(batteries => {
      flight.batteries = batteries;
      flight.batteryIds = batteries.map(b => b.batteryId).join(",");

      flight.videos = readdirSync(VIDEO_FOLDER).filter(file =>
        file.startsWith(flight.id)
      );

      return flight;
    });
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
      "SELECT f.id, f.plane, f.start_date, f.end_date, " +
        " f.duration, f.armed_time, f.flight_time, string_agg(distinct c.battery_id, ', ' ORDER BY c.battery_id) as battery_ids " +
        "FROM flights f " +
        "LEFT JOIN batterycycles c on c.flight_id = f.id " +
        "WHERE f.start_date::date = $1" +
        "GROUP BY f.id " +
        "ORDER BY f.start_date desc",
      day
    );
  }

  static find(id: string): Promise<Flight> {
    return db
      .one("SELECT * FROM flights f " + " WHERE f.id = $1", id)
      .then(this.enrich);
  }

  static delete(id: string): Promise<Flight> {
    return db.none("DELETE FROM flights WHERE id = $1", id);
  }

  static save(flight: Flight): Promise<Flight> {
    console.log(flight);
    return db
      .one(
        "INSERT INTO flights (id, plane, start_date, end_date,  duration, armed_time, flight_time, notes, segments) " +
          "VALUES (${id}, ${plane}, ${startDate}, ${endDate}, ${duration}, ${armedTime}, ${flightTime}, ${notes:json}, ${segments:json}) " +
          "ON CONFLICT (id) DO UPDATE SET " +
          " plane = ${plane}," +
          " start_date = ${startDate}," +
          " end_date = ${endDate}," +
          " duration = ${duration}," +
          " armed_time = ${armedTime}," +
          " flight_time = ${flightTime}," +
          " notes = ${notes:json}," +
          " segments = ${segments:json} " +
          "RETURNING *",
        flight
      )
      .then(this.enrich);
  }

  toString(flight: Flight) {
    return `flight ${flight.id} [
        flight start ${flight.startDate}
        flight end ${flight.endDate}
        duration ${formatDuration(flight.duration)}
        armed time ${formatDuration(flight.armedTime)}
        flight time ${formatDuration(flight.flightTime)}
]`;
  }
}
