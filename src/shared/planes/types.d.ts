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
  andSwitch?: string,
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
  modeArmed: string,
  logicalSwitchByModeArmed: LogicalSwitch,
  modeFlying: string,
  logicalSwitchByModeFlying: LogicalSwitch,
  modeStopped: string,
  logicalSwitchByModeStopped: LogicalSwitch,
  modeRestart: string,
  logicalSwitchByModeRestart: LogicalSwitch,
  stoppedStartsNewFlight: boolean
  totalByPlane?: IPlaneTotals
}

