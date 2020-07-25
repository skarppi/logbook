import { SegmentItem } from '../flights/types';

export class Telemetry {
  static voltage(item?: SegmentItem): number {
    return item?.['VFAS(V)'] || item?.['RxBt(V)'];
  }

  static capacity(item?: SegmentItem): number {
    return Number(item?.['Fuel(mAh)'] || item?.['Capa(mAh)']);
  }
}

