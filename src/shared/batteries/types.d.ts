import { BatteryState } from "./index";

export interface Battery {
  id: string;
  purchaseDate: Date;
  type: string;
  cells: number;
  capacity: number;
}

export interface BatteryCycle {
  id: number;
  date: Date;
  batteryId: string;
  state: BatteryState;
  flightId?: string;
  voltage?: number;
  discharged?: number;
  charged?: number;
}
