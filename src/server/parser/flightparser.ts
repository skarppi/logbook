import Segment from '../model/segment';
import SegmentItem from '../model/segmentitem';
import SegmentParser from './segmentparser';
import { Flight, Plane, LogicalSwitch } from '../../shared/flights/types';
import { SegmentType, LogicalFunction } from '../../shared/flights';
import { planes, defaultPlane } from '../../shared/planes';
import { FlightImpl } from './flight';
import { IParserOptions } from '.';


export default class FlightParser {
  private name: string;
  private currentSegment: SegmentParser = new SegmentParser();
  private currentSegments: Segment[] = [];
  private sessionCounter: number = 0;
  private options: IParserOptions;
  private flights: Flight[] = [];
  private plane: Plane;

  constructor(name: string, options: IParserOptions) {
    this.name = name;
    this.options = options;
    this.plane = planes[this.planeName] || defaultPlane;
  }

  public getFlights(): Flight[] {
    return this.flights;
  }

  public appendItem(item: SegmentItem) {
    if (this.currentSegment.splitFlightAt(item.timestamp, this.options.splitFlightsAfterSeconds)) {
      console.log(`Split flight at ${item.timestamp}`);
      this.endFlight();
    }

    let type = this.currentSegment.type;

    if (this.enabled(this.plane.modes.armed, item)) {
      if (this.enabled(this.plane.modes.startFlying, item)) {
        type = SegmentType.flying;
      } else if (!this.currentSegment.type
        || this.currentSegment.type === SegmentType.stopped
        || this.currentSegment.type === SegmentType.flying && this.enabled(this.plane.modes.endFlying, item)) {
        type = SegmentType.armed;
      }
    } else {
      type = SegmentType.stopped;
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
      const flight = new FlightImpl(this.name, this.planeName, this.sessionCounter, this.currentSegments);

      if (flight.flightTime === 0) {
        console.log(`Skipped empty flight ${flight}`);
      } else {
        this.flights.push(flight);
        console.log(`Ended flight ${flight}`);
      }
    }
    this.currentSegments = [];
  }

  private enabled(test: LogicalSwitch, item: SegmentItem): boolean {
    const value = item[test.key];
    if (test.op === LogicalFunction.greaterThan) {
      return value > test.value;
    } else if (test.op === LogicalFunction.lessThan) {
      return value < test.value;
    } else if (test.op === LogicalFunction.is) {
      return value === test.value;
    } else if (test.op === LogicalFunction.not) {
      return value !== test.value;
    }
  }

  private get planeName() {
    return this.name.split('-')[0];
  }

  private endSegment() {
    const segment = this.currentSegment.endSegment();
    if (segment) {
      this.currentSegments.push(segment);
    }
  }
}
