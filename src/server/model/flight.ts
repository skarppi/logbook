import { formatDuration } from "../../shared/utils/date";
import { FlightDay, Flight } from "../../shared/flights/types";
import { db } from "../db";
import { BatteryCycle } from '../../shared/batteries/types';

export default class FlightRepository {

  static listByFlight(flightId: string): Promise<BatteryCycle[]> {
    return db.manyOrNone(
      "SELECT * " +
      "FROM battery_cycles " +
      "WHERE flight_id = $1" +
      "ORDER BY battery_name desc",
      flightId
    );
  }


  static enrich(flight: Flight) {
    if (!flight) {
      return;
    }

    return FlightRepository.listByFlight(flight.id).then(batteries => {
      flight.batteries = batteries;
      flight.batteryNames = batteries.map(b => b.batteryName).join(",");
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
      "SELECT f.id, f.plane, f.session, f.start_date, f.end_date, " +
      " f.duration, f.armed_time, f.flight_time, string_agg(distinct c.battery_name, ', ' ORDER BY c.battery_name) as battery_names, " +
      " f.notes " +
      "FROM flights f " +
      "LEFT JOIN battery_cycles c on c.flight_id = f.id " +
      "WHERE f.start_date::date = $1" +
      "GROUP BY f.id " +
      "ORDER BY f.start_date desc",
      day
    );
  }

  static find(id: string): Promise<Flight | null> {
    return db
      .oneOrNone("SELECT * FROM flights f " + " WHERE f.id = $1", id)
      .then(this.enrich);
  }

  static delete(id: string): Promise<Flight> {
    return db.none("DELETE FROM flights WHERE id = $1", id);
  }

  static save(flight: Flight): Promise<Flight> {
    console.log(flight);
    return db
      .one(
        "INSERT INTO flights (id, plane, session, start_date, end_date,  duration, armed_time, flight_time, notes, segments) " +
        "VALUES (${id}, ${plane}, ${session}, ${startDate}, ${endDate}, ${duration}, ${armedTime}, ${flightTime}, ${notes:json}, ${segments:json}) " +
        "ON CONFLICT (id) DO UPDATE SET " +
        " plane = ${plane}," +
        " session = ${session}," +
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
