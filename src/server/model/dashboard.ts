import { db } from "../db";

import { Dashboard as IDashboard, Dataset } from "../../shared/dashboard";

import { groupBy, flow, unzip, uniq, flatten } from "lodash/fp";
const map = require("lodash/fp/map").convert({ cap: false });
import { addMonths } from "date-fns";

export default class Dashboard {
  static list(): Promise<IDashboard> {
    return db
      .manyOrNone(
        "SELECT to_char(start_date,'YYYY-MM-01') as month," +
          " plane," +
          " cast(sum(flight_time) as integer) as time, " +
          " cast(count(*) as integer) as count " +
          "FROM flights " +
          "GROUP BY 1,2 " +
          "ORDER BY month"
      )
      .then(items => {
        const months = uniq(items.map(i => i.month));

        const datasetGroups = ["FlightTime", "Flights"];

        const datasets = flow(
          groupBy(i => i["plane"]),
          map((items, plane) => {
            const sets = months.reduce((sets, month) => {
              const item = items.find(i => i.month === month) || {
                time: 0,
                count: 0
              };
              sets.push([item.time / 60, item.count]);
              return sets;
            }, []);

            return unzip(sets).map((set, index) => {
              return {
                label: `${plane} ${datasetGroups[index]}`,
                type: index === 0 ? "bar" : "line",
                data: set
              };
            });
          }),
          flatten
        )(items) as Dataset[];

        return {
          labels: months,
          datasets: datasets
        };

        // return {
        //   labels: planes,
        //   datasets: moi
        // };
        // .map((month, items) => {
        //   return items;
        // });

        // const planes = _(items).reduce(
        //   (planes, item) =>
        //     planes.indexOf(item.plane) !== -1 ? planes : [...planes, item.plane],
        //   []

        // return items.reduce((grouped, item) => {
        //   grouped[item.plane];
        //   return grouped;
        // }, []);
      });
  }
}
