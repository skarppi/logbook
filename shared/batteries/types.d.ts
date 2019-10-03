import { BatteryState } from "./index";
import { Flight } from "../flights/types";

export interface Battery {
  id?: number;
  name: string;
  purchaseDate: Date;
  type: string;
  cells: number;
  capacity: number;
  lastCycle?: BatteryCycle;
  batteryCycles?: {
    nodes: BatteryCycle[]
  }
}

export interface BatteryCycle {
  id: number;
  date: Date;
  batteryName: string;
  state: BatteryState;
  flightId?: string;
  voltage?: number;
  discharged?: number;
  charged?: number;
  resistance?: [number];
  flight?: Flight;
}
