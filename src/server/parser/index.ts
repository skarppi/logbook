import csv from './csv';
import FlightRepository from '../model/flight';
import * as config from '../config';
import SegmentItemImpl from '../model/segmentitem';
import FlightParser from './flightparser';
import { Flight } from '../../shared/flights/types';

export interface IParserOptions {
  splitFlightsAfterSeconds: number;
  timezoneOffset: number;
}

export function parseFile(filename: string, options: IParserOptions): Promise<Flight[]> {
  return csv(`${config.CSV_FOLDER}${filename}`).then(items => {
    const name = filename.substring(0, filename.lastIndexOf('.'));
    return parseData(name, items, options);
  });
}

export function parseData(id: string, items: object[], options: IParserOptions): Promise<Flight[]> {
  const parsed = items.reduce<FlightParser>(
    (state: FlightParser, i, index) => {
      const item = new SegmentItemImpl(options.timezoneOffset, i);
      state.appendItem(item);

      if (index === items.length - 1) {
        state.endFlight();
      }

      return state;
    },
    new FlightParser(id, options)
  );

  return Promise.all(
    parsed.getFlights().map(flight =>
      FlightRepository.find(flight.id).then(existing => {
        if (existing) {
          flight.notes = existing.notes;
        }
        return FlightRepository.save(flight).catch(err => {
          throw new Error(
            `Flight ${flight.id} starting ${flight.startDate} failed ${err}`
          );
        });
      })
    )
  );
}

function save(flight: Flight) { }
