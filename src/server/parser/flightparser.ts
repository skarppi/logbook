import Segment from "../model/segment";
import SegmentItem from "../model/segmentitem";
import SegmentParser from "./segmentparser";
import { Flight, FlightNotes } from "../../shared/flights/types";
import { durationInSeconds } from "../../shared/utils/date";
import { SegmentType } from "../../shared/flights";

class FlightFromCsv implements Flight {
  id: string;
  plane: string;
  session: number;
  startDate: Date;
  endDate: Date;
  duration: number;
  armedTime: number;
  flightTime: number;
  notes: FlightNotes = undefined;
  segments: Segment[];

  constructor(name: string, plane: string, session: number, segments: Segment[]) {

    if (!name.includes("Session")) {
      this.id = `${name}-Session${session}`;
    } else {
      this.id = name;
    }
    
    this.plane = plane;
    this.session = session;
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

    this.sessionCounter++;

    if (this.currentSegments.length > 0) {
      const flight = new FlightFromCsv(this.name, this.plane, this.sessionCounter, this.currentSegments);

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
