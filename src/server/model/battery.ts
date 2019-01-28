import { Battery } from "../../shared/batteries/types";
import { db } from "../db";

export default class BatteryRepository {
  static list(): Promise<Battery[]> {
    return db.manyOrNone("SELECT * " + "FROM batteries " + "ORDER BY id asc");
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
