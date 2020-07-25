import { formatDuration } from '../../../shared/utils/date';
import { Flight } from '../../../shared/flights/types';
import { db } from '../db';
import { BatteryCycle } from '../../../shared/batteries/types';

export default class BatteryCycleRepository {

  public static attachUsedBattery(flight: Flight): Promise<Flight> {
    console.log('attaching cycle', flight.batteries);
    return db
      .any(
        'UPDATE battery_cycles SET flight_id=${id},' +
        'start_voltage=COALESCE(start_voltage, ${startVoltage}), ' +
        'end_voltage=COALESCE(end_voltage, ${endVoltage}) ' +
        'WHERE id = ' +
        '(SELECT c.id FROM battery_cycles c ' +
        'WHERE c.flight_id IS NULL AND c.state = \'discharged\' ' +
        'AND (SELECT count(*) FROM battery_cycles e WHERE e.flight_id = ${id}) = 0 ' +
        'AND (SELECT count(*) FROM plane_batteries pb WHERE pb.plane_id = ${planeId} AND pb.battery_name = c.battery_name) > 0 ' +
        'ORDER BY id LIMIT 1) RETURNING *',
        {
          id: flight.id,
          planeId: flight.planeId,
          startVoltage: flight.batteries[0].startVoltage,
          endVoltage: flight.batteries[0].endVoltage
        }
      ).then(saved => {
        console.log('attached battery', saved);
        return flight;
      });
  }
}