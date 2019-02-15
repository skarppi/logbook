import { BatteryCycle } from "../../shared/batteries/types";
import { db } from "../db";

export default class BatteryCycleRepository {
  static nullify(battery: BatteryCycle) {
    const voltage = this.orNull(battery.voltage);
    const discharged = this.orNull(battery.discharged);
    const charged = this.orNull(battery.charged);
    const resistance = this.orNull(battery.resistance);

    return { ...battery, voltage, discharged, charged, resistance };
  }

  static orNull(number: any) {
    return number !== "" ? number : null;
  }

  static listByFlight(flightId: string): Promise<BatteryCycle[]> {
    return db.manyOrNone(
      "SELECT * " +
        "FROM batterycycles " +
        "WHERE flight_id = $1" +
        "ORDER BY battery_name desc",
      flightId
    );
  }

  static delete(id: string): Promise<BatteryCycle> {
    return db.none("DELETE FROM batterycycles WHERE id = $1", id);
  }

  static insert(battery: BatteryCycle): Promise<BatteryCycle> {
    return db.one(
      "INSERT INTO batterycycles (date, battery_name, state, flight_id, voltage, discharged, charged, resistance) " +
        "VALUES (${date}, ${batteryName}, ${state}, ${flightId}, ${voltage}, ${discharged}, ${charged}, ${resistance:json}) " +
        "RETURNING *",
      this.nullify(battery)
    );
  }

  static update(id: number, battery: BatteryCycle): Promise<BatteryCycle> {
    return db.one(
      "UPDATE batterycycles SET " +
        " date = ${date}," +
        " battery_name = ${batteryName}," +
        " state = ${state}," +
        " flight_id = ${flightId}," +
        " voltage = ${voltage}," +
        " discharged = ${discharged}," +
        " charged = ${charged}," +
        " resistance = ${resistance:json} " +
        "WHERE id = ${id} " +
        "RETURNING *",
      { ...this.nullify(battery), id }
    );
  }
}
