import { db } from "../db";

export default class Dashboard {
  static list(): Promise<Dashboard[]> {
    return db.manyOrNone(
      "SELECT to_char(start_date,'Mon') as month," +
        " extract(year from start_date) as year," +
        " plane," +
        " sum(flight_time) as flight_time " +
        "FROM flights " +
        "GROUP BY 1,2,3"
    );
  }
}
