import { formatDuration } from "../../../client/src/shared/utils/date";
import { Segment } from "../../../client/src/shared/flights/types";
import { SegmentType } from "../../../client/src/shared/flights";
import { SegmentItem } from "../../../client/src/shared/flights/types";
import { differenceInSeconds } from "date-fns";

export class SegmentImpl implements Segment {
  public type: SegmentType;
  public rows: SegmentItem[];
  public startDate: Date;
  public endDate: Date;
  public duration: number;

  constructor(type: SegmentType, rows: SegmentItem[]) {
    this.type = type;
    this.rows = rows;

    this.startDate = this.first.timestamp;
    this.endDate = this.last.timestamp;
    this.duration = differenceInSeconds(this.endDate, this.startDate);
  }

  public toString() {
    return `Segment ${this.type}
    segment start ${this.startDate}
    segment end ${this.endDate}
    segment duration ${formatDuration(this.duration)}`;
  }

  public get first(): SegmentItem {
    return this.rows[0];
  }

  public get last(): SegmentItem {
    return this.rows[this.rows.length - 1];
  }
}
