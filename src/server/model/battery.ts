import { BatteryCycle } from "../../shared/batteries/types";
import { db } from "../db";

export default class BatteryRepository {
  static nullify(battery: BatteryCycle) {
    const voltage = this.orNull(battery.voltage);
    const discharged = this.orNull(battery.discharged);
    const charged = this.orNull(battery.charged);

    return { ...battery, voltage, discharged, charged };
  }

  static orNull(number: any) {
    return number !== "" ? number : null;
  }

  static listByFlight(flightId: string): Promise<BatteryCycle[]> {
    return db.manyOrNone(
      "SELECT * " +
        "FROM batterycycles " +
        "WHERE flight_id = $1" +
        "ORDER BY battery_id desc",
      flightId
    );
  }

  static delete(id: string): Promise<BatteryCycle> {
    return db.none("DELETE FROM batterycycles WHERE id = $1", id);
  }

  static insert(battery: BatteryCycle): Promise<BatteryCycle> {
    return db.one(
      "INSERT INTO batterycycles (date, battery_id, state, flight_id, voltage, discharged, charged) " +
        "VALUES (${date}, ${batteryId}, ${state}, ${flightId}, ${voltage}, ${discharged}, ${charged}) " +
        "RETURNING *",
      this.nullify(battery)
    );
  }

  static update(id: number, battery: BatteryCycle): Promise<BatteryCycle> {
    return db.one(
      "UPDATE batterycycles SET " +
        " date = ${date}," +
        " battery_id = ${batteryId}," +
        " state = ${state}," +
        " flight_id = ${flightId}," +
        " voltage = ${voltage}," +
        " discharged = ${discharged}," +
        " charged = ${charged} " +
        "WHERE id = ${id} " +
        "RETURNING *",
      { ...this.nullify(battery), id }
    );
  }
}
