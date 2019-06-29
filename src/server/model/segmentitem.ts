import { SegmentItem, Plane } from '../../shared/flights/types';

export default class SegmentItemImpl implements SegmentItem {
  public Date: string;
  public Thr: string;
  public Time: string; // "12:00:26.600"

  private timezoneOffset: number;

  constructor(timezoneOffset: number, args) {
    Object.assign(this, args);
    this.timezoneOffset = timezoneOffset;
  }

  get timestamp(): Date {
    const plusMinus = this.timezoneOffset >= 0 ? '+' : '-';
    const hoursWithLeadingZero = ('00' + Math.abs(this.timezoneOffset)).slice(-2);

    const tz = `GMT${plusMinus}${hoursWithLeadingZero}00`;
    return new Date(`${this.Date} ${this.Time} ${tz}`);
  }
}
