import { SegmentItem } from "../flights/types";

export class Telemetry {
  static voltage(item?: SegmentItem): number | undefined {
    return item?.num("VFAS(V)") || item?.num("RxBt(V)");
  }

  static capacity(item?: SegmentItem): number | undefined {
    return item?.num("Fuel(mAh)") || item?.num("Capa(mAh)");
  }
}
