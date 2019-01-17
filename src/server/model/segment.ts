import { durationInSeconds, formatDuration } from "../../shared/utils/date";
import SegmentItem from "./segmentitem";
import { Segment as ISegment } from "../../shared/flights/types";
import { SegmentType } from "../../shared/flights";

export default class Segment implements ISegment {
  type: SegmentType;
  rows: SegmentItem[];
  startDate: Date;
  endDate: Date;
  duration: number;

  constructor(type: SegmentType, rows: SegmentItem[]) {
    this.type = type;
    this.rows = rows;

    this.startDate = this.first.timestamp;
    this.endDate = this.last.timestamp;
    this.duration = durationInSeconds(this.startDate, this.endDate);
  }

  private get first(): SegmentItem {
    return this.rows[0];
  }

  private get last(): SegmentItem {
    return this.rows[this.rows.length - 1];
  }

  toString() {
    return `Segment ${this.type}
    segment start ${this.startDate}
    segment end ${this.endDate}
    segment duration ${formatDuration(this.duration)}`;
  }
}
