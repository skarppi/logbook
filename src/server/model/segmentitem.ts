// flight timer stops when you disarm, and continues when you arm and apply at least 5% throttle
const ARMED_SWITCH = "SB";
const ARMED_VALUE = "1";

const THR_TRESHOLD = 0.05;
const THR_MIN = -1024;
const THR_MAX = 1024;

export default class SegmentItem {
  constructor(args) {
    Object.assign(this, args);
  }

  get timestamp(): Date {
    return new Date(`${this["Date"]} ${this["Time"]}`);
  }

  get armed(): Boolean {
    return this[ARMED_SWITCH] === ARMED_VALUE;
  }

  get flying(): Boolean {
    return (
      parseInt(this["Thr"]) >= THR_MIN + (THR_MAX - THR_MIN) * THR_TRESHOLD
    );
  }
}
