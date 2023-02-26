import { SegmentItem } from "../../../client/src/shared/flights/types";

export default class SegmentItemParser {

  private timezoneOffset: number;

  constructor(timezoneOffset: number) {
    this.timezoneOffset = timezoneOffset;
  }

  timestamp(item: SegmentItem): Date {
    const plusMinus = this.timezoneOffset >= 0 ? "+" : "-";
    const hoursWithLeadingZero = ("00" + Math.abs(this.timezoneOffset)).slice(
      -2
    );

    const tz = `GMT${plusMinus}${hoursWithLeadingZero}00`;
    return new Date(`${item.Date} ${item.Time} ${tz}`);
  }

  alt(item: SegmentItem): number | undefined {
    return item["GAlt(m)"] as number ?? item["Alt(m)"] as number;
  }
}
