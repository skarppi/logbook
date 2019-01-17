import csv from "./csv";
import FlightRepository from "../model/flight";
import * as config from "../config";
import SegmentItem from "../model/segmentitem";
import FlightParser from "./flightparser";
import { Flight, FlightNotes } from "../../shared/flights/types";

export function parseFile(filename: string): Promise<Flight[]> {
  return csv(`${config.CSV_FOLDER}${filename}`).then(items => {
    const name = filename.substring(0, filename.lastIndexOf("."));
    return parseData(name, items);
  });
}

export function parseData(
  id: string,
  items: object[],
  existingNotes?: FlightNotes
): Promise<Flight[]> {
  const parsed = items.reduce<FlightParser>(
    (state: FlightParser, item2, index) => {
      const item = new SegmentItem(item2);
      state.appendItem(item);

      if (index === items.length - 1) {
        state.endFlight();
      }

      return state;
    },
    new FlightParser(id)
  );

  return Promise.all(
    parsed.flights.map(flight => {
      if (existingNotes) {
        flight.notes = existingNotes;
      }

      return FlightRepository.save(flight).catch(err => {
        throw new Error(
          `Flight ${flight.id} starting ${flight.startDate} failed ${err}`
        );
      });
    })
  );
}
