import csv from "./csv";
import Flight from "../model/flight";
import * as config from "../config";
import SegmentItem from "../model/segmentitem";
import FlightParser from "./flightparser";

export function parseFile(filename: string): Promise<Flight[]> {
  return csv(`${config.CSV_FOLDER}${filename}`).then(results => {
    const name = filename.substring(0, filename.lastIndexOf("."));
    return parseData(name, results);
  });
}

export function parseData(id: string, results: object[]): Promise<Flight[]> {
  const parsed = results.reduce<FlightParser>(
    (state: FlightParser, item2, index) => {
      const item = new SegmentItem(item2);
      state.appendItem(item);

      if (index === results.length - 1) {
        state.endFlight();
      }

      return state;
    },
    new FlightParser(id)
  );

  return Promise.all(
    parsed.flights.map(flight => {
      return flight.save().catch(err => {
        throw new Error(
          `Flight ${flight.id} starting ${flight.startDate} failed ${err}`
        );
      });
    })
  );
}
