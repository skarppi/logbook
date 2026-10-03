import { BatteryState } from "./index";
import { Flight } from "../flights/types";

export interface Battery {
  id?: number;
  name: string;
  purchaseDate: Date;
  retirementDate?: Date;
  type: string;
  cells: number;
  capacity: number;
  lastCycle?: BatteryCycle;
  batteryCycles?: {
    nodes: BatteryCycle[];
  };
  notes?: string;
  __typename?: string;
}

export interface BatteryCycle {
  id?: number;
  date: string;
  batteryName: string;
  /** Battery database ID from EdgeTX widget telemetry - used only during import */
  batteryId?: number;
  state: BatteryState;
  flightId?: string;
  restingVoltage?: number;
  startVoltage?: number;
  endVoltage?: number;
  discharged?: number;
  charged?: number;
  resistance?: [number];
  flight?: Flight;
  __typename?: string;
}
