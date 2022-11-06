import { SegmentItem } from "../flights/types";

export class Telemetry {
  static voltage(item?: SegmentItem): number | undefined {
    return parseFloat(item?.["VFAS(V)"] || item?.["RxBt(V)"]);
  }

  static capacity(item?: SegmentItem): number | undefined {
    return parseFloat(item?.["Fuel(mAh)"] || item?.["Capa(mAh)"]);
  }
}
