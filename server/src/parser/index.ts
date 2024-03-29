import csv from "./csv";
import FlightRepository from "../model/flight";
import BatteryCycleRepository from "../model/batterycycle";
import * as config from "../config";
import SegmentItemParser from "../parser/segmentitem";
import FlightParser from "./flightparser";
import { Flight, SegmentItem } from "../../../client/src/shared/flights/types";

export interface IParserOptions {
  timezoneOffset: number;
  locationId: number;
}

export function parseFile(
  filename: string,
  options: IParserOptions
): Promise<Flight[]> {
  return csv<SegmentItem>(`${config.CSV_FOLDER}${filename}`).then((items) => {
    const name = filename.substring(0, filename.lastIndexOf("."));
    return parseData(name, items, options);
  });
}

export function parseData(
  id: string,
  items: SegmentItem[],
  options: IParserOptions
): Promise<Flight[]> {
  const parser = new FlightParser(id, options);
  return parser.fetchPlane().then(() => {
    const flights = getFlights(parser, items);
    return storeFlights(flights);
  });
}

function getFlights(parser: FlightParser, items: SegmentItem[]): Flight[] {
  const parsed = items.reduce<FlightParser>((state: FlightParser, i, index) => {
    state.appendItem(i);

    if (index === items.length - 1) {
      state.endFlight();
    }

    return state;
  }, parser);
  return parsed.getFlights();
}

function storeFlights(flights: Flight[]): Promise<Flight[]> {
  return flights.reduce(
    (p, flight) =>
      p.then((results) =>
        storeFlight(flight).then((result) => results.concat([result]))
      ),
    Promise.resolve([] as Flight[])
  );
}

function storeFlight(flight: Flight): Promise<Flight> {
  return FlightRepository.find(flight.id).then((existing) => {
    if (existing) {
      flight.notes = existing.notes;
      flight.locationId = existing.locationId;
      flight.session = existing.session;
    }
    return FlightRepository.save(flight)
      .then(BatteryCycleRepository.attachUsedBattery)
      .then(BatteryCycleRepository.fillMissingBatteryValues)
      .catch((err) => {
        console.log("Save failed", err, err.stack);
        throw new Error(
          `Flight ${flight.id} starting ${flight.startDate} failed ${err}`
        );
      });
  });
}
