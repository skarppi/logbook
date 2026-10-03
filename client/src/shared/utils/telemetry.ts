import { SegmentItem } from "../flights/types";

export class Telemetry {
  static voltage(item?: SegmentItem): number | undefined {
    return parseFloat(item?.["VFAS(V)"] || item?.["RxBt(V)"]);
  }

  static capacity(item?: SegmentItem): number | undefined {
    return parseFloat(item?.["Fuel(mAh)"] || item?.["Capa(mAh)"]);
  }

  /**
   * Extracts battery database ID from EdgeTX BatteryID widget telemetry.
   * The ID is pushed by the widget as "BatID" telemetry value.
   * Returns undefined if no battery is selected (ID is 0) or field is missing.
   */
  static batteryId(item?: SegmentItem): number | undefined {
    const id = parseInt(item?.["BatID"], 10);
    return id && !isNaN(id) && id > 0 ? id : undefined;
  }
}
