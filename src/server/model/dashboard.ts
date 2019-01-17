import { db } from "../db";

import {
  Dashboard as IDashboard,
  Dataset,
  DashboardQuery
} from "../../shared/dashboard/types";

import { groupBy, flow, unzip, uniq, flatten, sumBy, max } from "lodash/fp";
import { DashboardUnit } from "../../shared/dashboard";
import {
  addMonths,
  addDays,
  addYears,
  startOfMonth,
  startOfYear,
  startOfDay
} from "date-fns";
const map = require("lodash/fp/map").convert({ cap: false });

const DATEFORMAT = {
  day: "YYYY-MM-DD",
  month: "YYYY-MM-01",
  year: "YYYY-01-01"
};

const SECONDS_DIVIDER = 60;

function startDateFrom(query: DashboardQuery) {
  let now = new Date();
  if (query.unit === DashboardUnit.year) {
    return startOfYear(addYears(now, -query.size + 1));
  } else if (query.unit === DashboardUnit.month) {
    return startOfMonth(addMonths(now, -query.size + 1));
  } else {
    return startOfDay(addDays(now, -query.size + 1));
  }
}

// every plane has two datasets, one for flight time and one for count of flights
const groups = [
  { label: "FlightTime", type: "bar", yAxisID: "time" },
  { label: "Flights", type: "line", yAxisID: "count" }
];

export default class DashboardRepository {
  static list(query: DashboardQuery): Promise<IDashboard> {
    return db
      .manyOrNone(
        "SELECT to_char(start_date,$1) as date," +
          " plane," +
          " cast(sum(flight_time) as integer) as time, " +
          " cast(count(*) as integer) as count " +
          "FROM flights " +
          "WHERE start_date > $2 " +
          "GROUP BY 1,2 " +
          "ORDER BY date",
        [DATEFORMAT[query.unit], startDateFrom(query)]
      )
      .then(items => {
        const dates = uniq(items.map(i => i.date));
        const maxFlightTime =
          (flow(
            groupBy(i => i["date"]),
            map((group, date) => sumBy("time", group)),
            max
          )(items) as number) / SECONDS_DIVIDER || 0;

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
                label: `${plane} ${groups[index].label}`,
                type: groups[index].type,
                yAxisID: groups[index].yAxisID,
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
