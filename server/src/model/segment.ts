import { formatDuration } from '../../../shared/utils/date';
import { Segment } from '../../../shared/flights/types';
import { SegmentType } from '../../../shared/flights';
import SegmentItemImpl from './segmentitem';
import { differenceInSeconds } from 'date-fns';

export default class SegmentImpl implements Segment {
  public type: SegmentType;
  public rows: SegmentItemImpl[];
  public startDate: Date;
  public endDate: Date;
  public duration: number;

  constructor(type: SegmentType, rows: SegmentItemImpl[]) {
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

  private get first(): SegmentItemImpl {
    return this.rows[0];
  }

  private get last(): SegmentItemImpl {
    return this.rows[this.rows.length - 1];
  }
}
