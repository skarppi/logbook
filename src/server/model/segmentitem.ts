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

  constructor(args) {
    Object.assign(this, args);
  }

  get timestamp(): Date {
    return new Date(`${this.Date} ${this.Time}`);
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
