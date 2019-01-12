import { db } from "../db";

import { Dashboard as IDashboard, Dataset } from "../../shared/dashboard/types";

import { groupBy, flow, unzip, uniq, flatten, sumBy, max } from "lodash/fp";
import { DashboardUnit } from "../../shared/dashboard";
const map = require("lodash/fp/map").convert({ cap: false });

const DATEFORMAT = {
  day: "YYYY-MM-DD",
  month: "YYYY-MM-01",
  year: "YYYY-01-01"
};

const SECONDS_DIVIDER = 60;

export default class Dashboard {
  static list(unit: DashboardUnit): Promise<IDashboard> {
    return db
      .manyOrNone(
        "SELECT to_char(start_date,$1) as date," +
          " plane," +
          " cast(sum(flight_time) as integer) as time, " +
          " cast(count(*) as integer) as count " +
          "FROM flights " +
          "GROUP BY 1,2 " +
          "ORDER BY date",
        DATEFORMAT[unit]
      )
      .then(items => {
        const dates = uniq(items.map(i => i.date));
        const maxFlightTime =
          (flow(
            groupBy(i => i["date"]),
            map((group, date) => sumBy("time", group)),
            max
          )(items) as number) / SECONDS_DIVIDER || 0;

        const datasetGroups = ["FlightTime", "Flights"];

        const datasets = flow(
          groupBy(i => i["plane"]),
          map((items, plane) => {
            const sets = dates.reduce((sets, date) => {
              const item = items.find(i => i.date === date) || {
                time: 0,
                count: 0
              };
              sets.push([item.time / SECONDS_DIVIDER, item.count]);
              return sets;
            }, []);

            return unzip(sets).map((set, index) => {
              return {
                label: `${plane} ${datasetGroups[index]}`,
                type: index === 0 ? "bar" : "line",
                yAxisID: index === 0 ? "time" : "count",
                data: set
              };
            });
          }),
          flatten
        )(items) as Dataset[];

        return {
          labels: dates,
          max: maxFlightTime,
          datasets: datasets
        };
      });
  }
}
