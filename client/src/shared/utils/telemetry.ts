import { SegmentItem } from "../flights/types";

export class Telemetry {
  static voltage(item?: SegmentItem): number | undefined {
    return Telemetry.parse(item?.["VFAS(V)"] ?? item?.["RxBt(V)"]);
  }

  static capacity(item?: SegmentItem): number | undefined {
    return Telemetry.parse(item?.["Fuel(mAh)"] ?? item?.["Capa(mAh)"]);
  }

  /**
   * Parse a telemetry value into a number, returning undefined when the field
   * is missing or unparseable. Avoids producing NaN, which would otherwise
   * propagate into battery cycles and fail numeric DB inserts (planes without
   * a voltage/energy sensor have no such telemetry columns).
   */
  private static parse(value?: string): number | undefined {
    if (value === undefined || value === null || value === "") {
      return undefined;
    }
    const num = parseFloat(value);
    return isNaN(num) ? undefined : num;
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
