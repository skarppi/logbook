import { formatDuration } from '../../../shared/utils/date';
import { Flight } from '../../../shared/flights/types';
import { db } from '../db';
import { BatteryCycle } from '../../../shared/batteries/types';

export default class BatteryCycleRepository {

  public static attachUsedBattery(flight: Flight): Promise<Flight> {
    return db
      .any(
        'UPDATE battery_cycles SET flight_id=${id}' +
        'WHERE id = ' +
        '(SELECT c.id FROM battery_cycles c ' +
        'WHERE c.flight_id IS NULL AND c.state = \'discharged\' ' +
        'AND (SELECT count(*) FROM battery_cycles e WHERE e.flight_id = ${id}) = 0 ' +
        'AND (SELECT count(*) FROM plane_batteries pb WHERE pb.plane_id = ${planeId} AND pb.battery_name = c.battery_name) > 0 ' +
        'ORDER BY id LIMIT 1) RETURNING *',
        flight
      ).then(saved => {
        console.log('attached battery', saved);
        return flight;
      });
  }
}