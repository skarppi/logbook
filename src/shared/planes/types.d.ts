import { LogicalFunction, PlaneType } from "./index";

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

export interface Plane {
  id: string,
  type: PlaneType,
  batterySlots: number;
  batteries: string[];
  ignoreTelemetries: string[];
  flightModes: string[];
  modes: {
    armed: LogicalSwitch,
    flying: LogicalSwitch,
    stopped: LogicalSwitch,
    restart: LogicalSwitch,
    stoppedStartsNewFlight: boolean
  }
}

