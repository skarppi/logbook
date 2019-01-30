import { durationInSeconds } from "../../shared/utils/date";
import Segment from "../model/segment";
import SegmentItem from "../model/segmentitem";
import { SegmentType } from "../../shared/flights";

const SPLIT_FLIGHTS_AFTER_SECONDS = 30;

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
    return (
      this.last &&
      durationInSeconds(this.last.timestamp, timestamp) >
        SPLIT_FLIGHTS_AFTER_SECONDS
    );
  }

  splitSegment(type: SegmentType, latest: SegmentItem) {
    if (this.type === type) {
      return false;
    } else if (this.type === SegmentType.flying && type === SegmentType.armed) {
      // stop flying if more than 3 entries indicate we are stopped
      const history = this.items.slice(-10, -3).find(item => !item.flying);
      if (history) {
        return true;
      }

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
