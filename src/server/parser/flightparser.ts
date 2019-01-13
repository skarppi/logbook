import Flight from "../model/flight";
import Segment, { SegmentType } from "../model/segment";
import SegmentItem from "../model/segmentitem";
import SegmentParser from "./segmentparser";

export default class FlightParser {
  name: string;
  currentSegment: SegmentParser = new SegmentParser();
  currentSegments: Segment[] = [];
  sessionCounter: number = 0;
  flights: Flight[] = [];

  constructor(name: string) {
    this.name = name;
  }

  appendItem(item: SegmentItem) {
    if (this.currentSegment.splitFlightAt(item.timestamp)) {
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

  private generateId() {
    this.sessionCounter++;
    if (!this.name.includes("Session")) {
      return `${this.name}-Session${this.sessionCounter}`;
    }

    return this.name;
  }

  private get plane() {
    return this.name.split("-")[0];
  }

  private endSegment() {
    const segment = this.currentSegment.endSegment();
    if (segment) {
      this.currentSegments.push(segment);
    }
  }

  endFlight() {
    this.endSegment();

    const id = this.generateId();

    if (this.currentSegments.length > 0) {
      const flight = new Flight(id, this.plane, this.currentSegments);

      if (flight.flightTime === 0) {
        console.log(`Skipped empty flight ${flight}`);
      } else {
        this.flights.push(flight);
        console.log(`Ended flight ${flight}`);
      }
    }
    this.currentSegments = [];
  }
}
