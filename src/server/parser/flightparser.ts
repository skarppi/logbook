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
    let type = this.currentSegment.type || SegmentType.stopped;

    if (type === SegmentType.flying && this.test(this.plane.modes.stopped, item)) {
      type = SegmentType.stopped;
    }

    if (this.test(this.plane.modes.armed, item)) {
      if (this.test(this.plane.modes.flying, item)) {
        type = SegmentType.flying;
      } else if (type === SegmentType.stopped) {
        type = SegmentType.armed;
      }
    } else {
      type = SegmentType.stopped;
    }


    // if (this.currentSegment.splitFlightAt(item.timestamp, this.options.splitFlightsAfterSeconds)) {
    if (type === SegmentType.stopped && this.currentSegment.type !== SegmentType.stopped && this.plane.modes.stoppedStartsNewFlight
      || this.test(this.plane.modes.restart, item)) {
      this.endFlight();
    } else if (this.currentSegment.type !== type) {
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

  private test(test: LogicalSwitch, item: SegmentItem): boolean {
    if (test.duration > 0) {
      const items = this.currentSegment.lastSecondsFromEnd(item.timestamp, test.duration)
      if (!items) {
        return this.testExpectNull(test);
      }

      return !items.find(current => !this.testItem(test, current))
    } else {
      return this.testItem(test, item);
    }
  }

  private testExpectNull(test: LogicalSwitch): boolean {
    return test.v1 === null;
  }

  private testItem(test: LogicalSwitch, item: SegmentItem): boolean {
    if (!item) {
      return this.testExpectNull(test);
    }

    const v1 = item[test.v1];
    const v2 = Number(test.v2);

    if (test.func === LogicalFunction.greaterThan) {
      return v1 > v2;
    } else if (test.func === LogicalFunction.lessThan) {
      return v1 < v2;
    } else if (test.func === LogicalFunction.is) {
      return v1 === v2;
    } else if (test.func === LogicalFunction.not) {
      return v1 !== v2;
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
