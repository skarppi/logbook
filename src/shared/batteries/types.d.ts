import { BatteryState } from "./index";

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
