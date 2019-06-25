import Segment from '../model/segment';
import SegmentItem from '../model/segmentitem';
import SegmentParser from './segmentparser';
import { Flight } from '../../shared/flights/types';
import { SegmentType } from '../../shared/flights';
import { FlightImpl } from './flight';
import { flightsRouter } from '../routes/flights-router';
import { IParserOptions } from '.';

export default class FlightParser {
  private name: string;
  private currentSegment: SegmentParser = new SegmentParser();
  private currentSegments: Segment[] = [];
  private sessionCounter: number = 0;
  private options: IParserOptions;
  private flights: Flight[] = [];

  constructor(name: string, options: IParserOptions) {
    this.name = name;
    this.options = options;
  }

  public getFlights(): Flight[] {
    return this.flights;
  }

  public appendItem(item: SegmentItem) {
    if (this.currentSegment.splitFlightAt(item.timestamp, this.options.splitFlightsAfterSeconds)) {
      console.log(`Split flight at ${item.timestamp}`);
      this.endFlight();
    }

    let type = SegmentType.stopped;
    if (item.armed) {
      type = item.flying ? SegmentType.flying : SegmentType.armed;
    }

    if (this.currentSegment.splitSegment(type, item)) {
      this.endSegment();
    }

    this.currentSegment.appendItem(type, item);
  }

  public endFlight() {
    this.endSegment();

    this.sessionCounter++;

    if (this.currentSegments.length > 0) {
      const flight = new FlightImpl(this.name, this.plane, this.sessionCounter, this.currentSegments);

      if (flight.flightTime === 0) {
        console.log(`Skipped empty flight ${flight}`);
      } else {
        this.flights.push(flight);
        console.log(`Ended flight ${flight}`);
      }
    }
    this.currentSegments = [];
  }

  private get plane() {
    return this.name.split('-')[0];
  }

  private endSegment() {
    const segment = this.currentSegment.endSegment();
    if (segment) {
      this.currentSegments.push(segment);
    }
  }
}
