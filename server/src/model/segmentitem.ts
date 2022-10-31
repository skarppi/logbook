import { SegmentItem } from "../../../client/src/shared/flights/types";

export default class SegmentItemImpl implements SegmentItem {
  public Date: string;
  public Thr: string;
  public Time: string; // "12:00:26.600"

  //public data: { [k: string]: string | number };

  private timezoneOffset: number;

  constructor(timezoneOffset: number, args) {
    Object.assign(this, args);
    this.timezoneOffset = timezoneOffset;
  }

  get timestamp(): Date {
    const plusMinus = this.timezoneOffset >= 0 ? "+" : "-";
    const hoursWithLeadingZero = ("00" + Math.abs(this.timezoneOffset)).slice(
      -2
    );

    const tz = `GMT${plusMinus}${hoursWithLeadingZero}00`;
    return new Date(`${this.Date} ${this.Time} ${tz}`);
  }

  num(col: string): number {
    return this[col] as number;
  }
  str(col: string): string {
    return this[col] as string;
  }

  get alt(): number {
    return this.num("GAlt(m)") ?? this.num("Alt(m)");
  }
}
