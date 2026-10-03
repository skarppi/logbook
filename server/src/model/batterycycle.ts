import { formatDuration } from "../../../client/src/shared/utils/date";
import { Flight } from "../../../client/src/shared/flights/types";
import { db } from "../db";
import { BatteryCycle } from "../../../client/src/shared/batteries/types";

export default class BatteryCycleRepository {
  /**
   * Attaches a battery cycle to a flight.
   *
   * @param flight - The flight to attach a battery to
   *
   * If the first battery cycle carries a batteryId (from the EdgeTX BatteryID
   * widget telemetry), it will find the battery by its database ID and create a
   * cycle. Otherwise falls back to the legacy behavior of finding any unassigned
   * discharged battery cycle for the plane.
   */
  public static attachUsedBattery(flight: Flight): Promise<Flight> {
    const firstBattery = flight.batteries?.[0];
    console.log("attaching battery", firstBattery);

    // If we have a battery ID from telemetry, look up the battery directly
    if (firstBattery?.batteryId && firstBattery.batteryId > 0) {
      return BatteryCycleRepository.attachById(flight, firstBattery);
    }

    // Fallback: legacy behavior - find any unassigned discharged cycle for this plane
    return BatteryCycleRepository.attachLegacy(flight, firstBattery);
  }

  /**
   * Creates a battery cycle for the battery with the given database ID.
   */
  private static attachById(
    flight: Flight,
    firstBattery: BatteryCycle,
  ): Promise<Flight> {
    const batteryId = firstBattery.batteryId;
    return db
      .oneOrNone(
        `SELECT b.name FROM batteries b
         JOIN plane_batteries pb ON pb.battery_name = b.name
         WHERE b.id = $1 AND pb.plane_id = $2
         LIMIT 1`,
        [batteryId, flight.planeId],
      )
      .then((battery) => {
        if (!battery) {
          console.log(
            `No battery found with id ${batteryId} for plane ${flight.planeId}`,
          );
          return flight;
        }

        console.log(`Matched battery ${battery.name} by id ${batteryId}`);

        // Insert a new battery cycle for this flight
        return db
          .none(
            `INSERT INTO battery_cycles (date, battery_name, state, flight_id, discharged, start_voltage, end_voltage)
             VALUES ($1, $2, 'discharged', $3, $4, $5, $6)
             ON CONFLICT (battery_name, flight_id) DO UPDATE SET
               discharged = COALESCE(battery_cycles.discharged, EXCLUDED.discharged),
               start_voltage = COALESCE(battery_cycles.start_voltage, EXCLUDED.start_voltage),
               end_voltage = COALESCE(battery_cycles.end_voltage, EXCLUDED.end_voltage)`,
            [
              flight.startDate,
              battery.name,
              flight.id,
              firstBattery?.discharged,
              firstBattery?.startVoltage,
              firstBattery?.endVoltage,
            ],
          )
          .then(() => {
            console.log(`Created/updated battery cycle for ${battery.name}`);
            return flight;
          });
      });
  }

  /**
   * Legacy battery attachment: finds any unassigned discharged battery cycle
   * for the plane and attaches it to this flight.
   */
  private static attachLegacy(
    flight: Flight,
    firstBattery: BatteryCycle | undefined,
  ): Promise<Flight> {
    return db
      .any(
        "UPDATE battery_cycles SET flight_id=${id}," +
          "discharged=COALESCE(discharged, ${discharged})," +
          "start_voltage=COALESCE(start_voltage, ${startVoltage}), " +
          "end_voltage=COALESCE(end_voltage, ${endVoltage}) " +
          "WHERE id = " +
          "(SELECT c.id FROM battery_cycles c " +
          "WHERE c.flight_id IS NULL AND c.state = 'discharged' " +
          "AND (SELECT count(*) FROM battery_cycles e WHERE e.flight_id = ${id}) = 0 " +
          "AND (SELECT count(*) FROM plane_batteries pb WHERE pb.plane_id = ${planeId} AND pb.battery_name = c.battery_name) > 0 " +
          "ORDER BY id LIMIT 1) RETURNING *",
        {
          id: flight.id,
          planeId: flight.planeId,
          discharged: firstBattery?.discharged,
          startVoltage: firstBattery?.startVoltage,
          endVoltage: firstBattery?.endVoltage,
        },
      )
      .then((saved) => {
        console.log("attached battery (legacy)", saved);
        return flight;
      });
  }

  public static fillMissingBatteryValues(flight: Flight): Promise<Flight> {
    console.log("fixing missing cycle", flight.batteries);
    const firstBattery = flight.batteries?.[0];
    return db
      .any(
        "UPDATE battery_cycles SET " +
          "discharged=COALESCE(discharged, ${discharged})," +
          "start_voltage=COALESCE(start_voltage, ${startVoltage}), " +
          "end_voltage=COALESCE(end_voltage, ${endVoltage}) " +
          "WHERE flight_id=${id} AND (discharged is NULL OR start_voltage IS NULL or end_voltage IS NULL)",
        {
          id: flight.id,
          discharged: firstBattery?.discharged,
          startVoltage: firstBattery?.startVoltage,
          endVoltage: firstBattery?.endVoltage,
        },
      )
      .then((saved) => {
        console.log("fixed battery", saved);
        return flight;
      });
  }
}
