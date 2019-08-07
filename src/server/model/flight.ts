import { formatDuration } from '../../shared/utils/date';
import { Flight } from '../../shared/flights/types';
import { db } from '../db';

export default class FlightRepository {

  static find(id: string): Promise<Flight | null> {
    return db.oneOrNone('SELECT * FROM flights f ' + ' WHERE f.id = $1', id);
  }

  static save(flight: Flight): Promise<Flight> {
    console.log(flight);
    return db
      .one(
        'INSERT INTO flights (id, plane_id, session, start_date, end_date,  duration, armed_time, flight_time, notes, segments) ' +
        'VALUES (${id}, ${planeId}, ${session}, ${startDate}, ${endDate}, ${duration}, ${armedTime}, ${flightTime}, ${notes:json}, ${segments:json}) ' +
        'ON CONFLICT (id) DO UPDATE SET ' +
        ' plane_id = ${planeId},' +
        ' session = ${session},' +
        ' start_date = ${startDate},' +
        ' end_date = ${endDate},' +
        ' duration = ${duration},' +
        ' armed_time = ${armedTime},' +
        ' flight_time = ${flightTime},' +
        ' notes = ${notes:json},' +
        ' segments = ${segments:json} ' +
        'RETURNING *',
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
