import { db } from "../db";

export default class LocationRepository {
  static list(): Promise<string[]> {
    return db
      .manyOrNone(
        "SELECT distinct notes->>'location' as location " +
          "from flights " +
          "where notes->>'location' is not null and notes->>'location' != '' " +
          "order by location"
      )
      .then(locations => locations.map(l => l.location));
  }
}
