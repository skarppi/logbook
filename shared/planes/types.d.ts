import { LogicalFunction, PlaneType } from "./index";
import { Battery } from "../batteries/types";
import { Segment, Flight } from "../flights/types";

export interface IPlaneTotals {
  plane: string;
  flights: number;
  totalTime: number;
}

export interface LogicalSwitch {
  id: string,
  nodeId?: string,
  func: LogicalFunction,
  v1: string,
  v2?: string,
  andSwitch?: string,
  duration?: number,
  delay?: number,
  description?: string,
  __typename?: string,
}

export interface Telemetry {
  id: string,
  default: boolean,
  ignore: boolean,
}

export interface Plane {
  id: string,
  nodeId?: string,
  type: PlaneType,
  batterySlots: number;
  planeBatteries?: {
    nodes: Array<{
      batteryName: string
    }>;
  }
  telemetries: Telemetry[];
  flightModes?: string[];
  modeArmed: string,
  logicalSwitchByModeArmed?: LogicalSwitch,
  modeFlying: string,
  logicalSwitchByModeFlying?: LogicalSwitch,
  modeStopped: string,
  logicalSwitchByModeStopped?: LogicalSwitch,
  modeRestart: string,
  logicalSwitchByModeRestart?: LogicalSwitch,
  modeStoppedStartsNewFlight: boolean
  totalByPlane?: IPlaneTotals,
  flights?: {
    nodes: Array<Flight>;
  },
  __typename?: string,
}

