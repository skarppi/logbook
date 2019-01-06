import { duration } from "../../shared/utils/date";
import Segment, { SegmentType } from "../model/segment";
import SegmentItem from "../model/segmentitem";

export default class SegmentParser {
  type?: SegmentType;
  items: SegmentItem[] = [];

  get last() {
    if (this.items.length > 0) {
      return this.items[this.items.length - 1];
    }
  }

  private startSegment(type: SegmentType) {
    this.items = [];
    this.type = type;
  }

  splitFlightAt(timestamp: Date) {
    return this.last && duration(this.last.timestamp, timestamp) > 30;
  }

  splitSegment(type: SegmentType) {
    if (this.type === type) {
      return false;
    } else if (this.type === SegmentType.flying && type === SegmentType.ready) {
      return false;
    }
    return true;
  }

  endSegment() {
    let segment: Segment;
    if (this.type && this.items.length > 0) {
      console.log(
        `Ending segment ${this.type} with ${this.items.length} items`
      );
      segment = new Segment(this.type, this.items);
      console.log(`Ended segment ${segment}`);
    }
    this.startSegment(undefined);
    return segment;
  }

  appendItem(type: SegmentType, item: SegmentItem) {
    if (!this.type) {
      this.startSegment(type);
    }
    this.items.push(item);
  }
}
