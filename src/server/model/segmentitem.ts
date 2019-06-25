import { SegmentItem } from '../../shared/flights/types';

// flight timer stops when you disarm, and continues when you arm and apply at least 5% throttle
const ARMED_SWITCH = 'SB';
const NOT_ARMED_VALUE = '-1';

const THR = 'Thr';
const THR_TRESHOLD = 0.05;
const THR_MIN = -1024;
const THR_MAX = 1024;

const VERTICAL_SPEED = 'VSpd(m/s)';
const VERTICAL_SPEED_TRESHOLD_MS = 1;

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
    const tz = `GMT${this.timezoneOffset >= 0 ? '+' : '-'}${('00' + this.timezoneOffset).slice(-2)}00`;
    return new Date(`${this.Date} ${this.Time} ${tz}`);
  }

  get armed(): boolean {
    return this[ARMED_SWITCH] !== NOT_ARMED_VALUE;
  }

  get flying(): boolean {
    if (this[VERTICAL_SPEED] !== undefined) {
      return (parseInt(this[VERTICAL_SPEED]) >= VERTICAL_SPEED_TRESHOLD_MS);
    } else {
      return (parseInt(this[THR]) >= THR_MIN + (THR_MAX - THR_MIN) * THR_TRESHOLD);
    }
  }
}
