import { Battery } from "../../shared/batteries/types";
import { db } from "../db";

export default class BatteryRepository {
  static extractCycle(rows: any) {
    const { cycleId, state, date, flightId, ...battery } = rows;

    const cycle = cycleId
      ? {
          id: cycleId,
          state,
          date,
          flightId
        }
      : null;

    return [battery, cycle];
  }

  static list(): Promise<Battery[]> {
    return db
      .manyOrNone(
        "SELECT distinct on (b.id) b.*, c.id as cycle_id, c.state, c.date, c.flight_id " +
          "FROM batteries b " +
          "LEFT JOIN batterycycles c on c.battery_id = b.id " +
          "ORDER BY b.id asc, c.date desc"
      )
      .then(rows =>
        rows.map(row => {
          const [battery, cycle] = this.extractCycle(row);
          battery["lastCycle"] = cycle;
          return battery;
        })
      );
  }

  static get(id: string): Promise<Battery[]> {
    return db
      .manyOrNone(
        "SELECT b.*, c.id as cycle_id, c.state, c.date, c.flight_id " +
          "FROM batteries b " +
          "LEFT JOIN batterycycles c on c.battery_id = b.id " +
          "WHERE b.id = $1 " +
          "ORDER BY b.id asc, c.date desc",
        id
      )
      .then(cycles => {
        const [battery] = this.extractCycle(cycles[0]);
        battery["cycles"] = cycles.map(cycle => {
          const { id, type, cells, capacity, purchaseDate, ...rest } = cycle;
          return rest;
        });
        return battery;
      });
  }

  static delete(id: string): Promise<Battery> {
    return db.none("DELETE FROM batteries WHERE id = $1", id);
  }

  static insert(battery: Battery): Promise<Battery> {
    return db.one(
      "INSERT INTO batteries (id, purchase_date, type, cells, capacity) " +
        "VALUES (${id}, ${purchaseDate}, ${type}, ${cells}, ${capacity}) " +
        "RETURNING *",
      battery
    );
  }

  static update(id: number, battery: Battery): Promise<Battery> {
    return db.one(
      "UPDATE batteries SET " +
        " id = ${id}," +
        " purchase_date = ${purchaseDate}," +
        " type = ${type}," +
        " cells = ${cells}," +
        " capacity = ${capacity}," +
        "WHERE id = ${id} " +
        "RETURNING *",
      { ...battery, id }
    );
  }
}
