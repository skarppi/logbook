import { duration, formatDuration } from "../utils/date";

export default class Segment {
  start: Date;
  end?: Date;

  constructor(start: Date) {
    this.start = start;
  }

  update(now: Date) {
    this.end = now;
  }

  get duration(): number {
    return duration(this.start, this.end);
  }

  toString() {
    return `Segment duration ${formatDuration(this.duration)}`;
  }
}
