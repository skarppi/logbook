import Segment from "../model/segment";
import SegmentItem from "../model/segmentitem";
import SegmentParser from "./segmentparser";
import { Flight, FlightNotes } from "../../shared/flights/types";
import { durationInSeconds } from "../../shared/utils/date";
import { SegmentType } from "../../shared/flights";

class FlightFromCsv implements Flight {
  id: string;
  plane: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  armedTime: number;
  flightTime: number;
  notes: FlightNotes = undefined;
  segments: Segment[];

  constructor(id: string, plane: string, segments: Segment[]) {
    this.id = id;
    this.plane = plane;
    this.segments = segments;
    this.startDate = segments[0].startDate;
    this.endDate = segments[segments.length - 1].endDate;
    this.duration = durationInSeconds(this.startDate, this.endDate);

    this.armedTime = this.segments
      .filter(segment => segment.type !== SegmentType.stopped)
      .reduce((sum, segment) => sum + segment.duration, 0);

    this.flightTime = this.segments
      .filter(segment => segment.type === SegmentType.flying)
      .reduce((sum, segment) => sum + segment.duration, 0);
  }
}

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
      const flight = new FlightFromCsv(id, this.plane, this.currentSegments);

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
