import Segment from '../model/segment';
import SegmentItem from '../model/segmentitem';
import { SegmentType } from '../../../shared/flights';
import { differenceInSeconds } from 'date-fns';

export default class SegmentParser {
  public type?: SegmentType;
  private items: SegmentItem[] = [];

  get last() {
    if (this.items.length > 0) {
      return this.items[this.items.length - 1];
    }
  }

  public isEmpty() {
    return this.items.length === 0;
  }

  public lastSecondsFromEnd(now: Date, seconds: number) {
    const inTheRange = this.items.findIndex(item => {
      return differenceInSeconds(now, item.timestamp) < seconds;
    });
    if (inTheRange >= 0) {
      return this.items.slice(inTheRange);
    }
  }

  public endSegment() {
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

  public appendItem(type: SegmentType, item: SegmentItem) {
    if (!this.type) {
      this.startSegment(type);
    }
    this.items.push(item);
  }

  private startSegment(type: SegmentType) {
    this.items = [];
    this.type = type;
  }

}
