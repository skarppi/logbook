import csv from './csv';
import FlightRepository from '../model/flight';
import BatteryCycleRepository from '../model/batterycycle';
import * as config from '../config';
import SegmentItemImpl from '../model/segmentitem';
import FlightParser from './flightparser';
import { Flight } from '../../../shared/flights/types';

export interface IParserOptions {
  timezoneOffset: number;
  locationId: number;
}

export function parseFile(filename: string, options: IParserOptions): Promise<Flight[]> {
  return csv(`${config.CSV_FOLDER}${filename}`).then(items => {
    const name = filename.substring(0, filename.lastIndexOf('.'));
    return parseData(name, items, options);
  });
}

export function parseData(id: string, items: object[], options: IParserOptions): Promise<Flight[]> {
  const parser = new FlightParser(id, options);
  return parser.fetchPlane().then(() =>
    Promise.all(
      getFlights(parser, items).map(storeFlight)
    ));
}

function getFlights(parser: FlightParser, items: object[]): Flight[] {
  const parsed = items.reduce<FlightParser>((state: FlightParser, i, index) => {
    const item = new SegmentItemImpl(parser.getOptions().timezoneOffset, i);
    state.appendItem(item);

    if (index === items.length - 1) {
      state.endFlight();
    }

    return state;
  }, parser);
  return parsed.getFlights();
}

function storeFlight(flight: Flight): Promise<Flight> {
  return FlightRepository.find(flight.id).then(existing => {
    if (existing) {
      flight.notes = existing.notes;
      flight.locationId = existing.locationId;
      flight.session = existing.session;
    }
    return FlightRepository.save(flight)
      .then(BatteryCycleRepository.attachUsedBattery)
      .catch(err => {
        console.log('Save failed', err, err.stack);
        throw new Error(
          `Flight ${flight.id} starting ${flight.startDate} failed ${err}`
        );
      });
  });
}