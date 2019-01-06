import csv from "./csv";
import Flight from "../model/flight";
import { duration, formatDuration } from "../../shared/utils/date";
import * as config from "../config";
import Segment, { SegmentType } from "../model/segment";
import SegmentItem from "../model/segmentitem";
import FlightParser from "./flightparser";

export default function parse(filename: string): Promise<Flight[]> {
  return csv(`${config.CSV_FOLDER}${filename}`).then(results => {
    const parsed = results.reduce<FlightParser>(
      (state: FlightParser, item2, index) => {
        const item = new SegmentItem(item2);
        if (item.armed) {
          const type = item.flying ? SegmentType.flying : SegmentType.ready;
          state.appendItem(type, item);
        } else {
          state.appendItem(SegmentType.stopped, item);
        }

        if (index === results.length - 1) {
          state.endFlight();
        }

        return state;
      },
      new FlightParser(filename)
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
  });
}
