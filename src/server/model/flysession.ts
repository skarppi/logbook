import Segment from "./segment";
import { duration, formatDuration } from "../utils/date";
import { IFlySession } from "../../shared/IFlySession";

export default class FlySession implements IFlySession {
  name: string;
  plane: string;
  startDate: Date;
  endDate?: Date;
  flightTime: number = 0;
  segment: Segment;
  duration: number;

  constructor(name: string, plane: string, startDate: Date) {
    this.name = name;
    this.plane = plane;
    this.startDate = startDate;
  }

  startTimer(now: Date, flying: Boolean) {
    if (this.segment) {
      this.segment.update(now);
    } else if (flying) {
      this.segment = new Segment(now);
    }
  }

  stopTimer(now?: Date) {
    if (this.segment) {
      if (now) {
        this.segment.update(now);
      }

      this.flightTime += this.segment.duration;

      console.log(`${this.segment}`);

      this.endDate = this.segment.end;
      this.duration = duration(this.startDate, this.endDate);

      this.segment = undefined;
    }
  }

  endSession(now?: Date) {
    this.stopTimer(now);

    console.log(this.toString());

    return this;
  }

  toString() {
    return `fly session ${this.name} [
        log start ${this.startDate}
        log end ${this.endDate}
        log duration ${formatDuration(this.duration)}
        flight duration ${formatDuration(this.flightTime)}
]`;
  }
}
