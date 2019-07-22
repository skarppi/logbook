import { LogicalFunction, PlaneType } from "./index";
import { Battery } from "../batteries/types";

export interface IPlaneTotals {
  plane: string;
  flights: number;
  totalTime: number;
}

export interface LogicalSwitch {
  id: string,
  func: LogicalFunction,
  v1: string,
  v2?: string,
  and?: string,
  duration?: number,
  delay?: number,
  description?: string
}

export interface Telemetry {
  default: boolean,
  ignore: boolean,
}

export interface Plane {
  id: string,
  type: PlaneType,
  batterySlots: number;
  planeBatteries: {
    nodes: Array<{
      batteryName: string
    }>;
  }
  telemetries: Map<string, Telemetry>;
  flightModes: string[];
  logicalSwitchByModeArmed: LogicalSwitch,
  logicalSwitchByModeFlying: LogicalSwitch,
  logicalSwitchByModeStopped: LogicalSwitch,
  logicalSwitchByModeRestart: LogicalSwitch,
  stoppedStartsNewFlight: boolean
  totalByPlane?: IPlaneTotals
}

