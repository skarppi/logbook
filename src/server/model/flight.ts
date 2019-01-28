import { formatDuration } from "../../shared/utils/date";
import {
  Flight as IFlight,
  FlightDay,
  Flight
} from "../../shared/flights/types";
import { db } from "../db";
import BatteryCycleRepository from "./batterycycle";

export default class FlightRepository {
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
    return db
      .one("SELECT * FROM flights f " + " WHERE f.id = $1", id)
      .then(flight =>
        BatteryCycleRepository.listByFlight(id).then(batteries => {
          flight.batteries = batteries;
          return flight;
        })
      );
  }

  static delete(id: string): Promise<Flight> {
    return db.none("DELETE FROM flights WHERE id = $1", id);
  }

  static save(flight: Flight): Promise<Flight> {
    console.log(flight);
    return db.one(
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
    );
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
