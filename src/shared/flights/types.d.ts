import { SegmentType, LogicalFunction } from "./index";
import { BatteryCycle } from "../batteries/types";

export interface Flight {
  id: string;
  plane: string;
  session: number;
  startDate: Date;
  endDate: Date;
  duration: number;
  armedTime: number;
  flightTime: number;
  segments: Segment[];
  batteries?: BatteryCycle[];
  batteryNames?: string;
  notes?: FlightNotes;
  batteryCyclesByFlightId?: {
    nodes: BatteryCycle[]
  }
}

export interface FlightNotes {
  osd?: string;
  location?: string;
  journal?: string;
}

export interface FlightDay {
  date: Date;
  flights: number;
  planes: string[];
  duration: number;
  armedTime: number;
  flightTime: number;
}

export interface LogicalSwitch {
  op: LogicalFunction,
  key: string,
  value: number
}

export interface Plane {
  name: string,
  batterySlots: number;
  batteries: string[];
  ignoreTelemetries: string[];
  flightModes: string[];
  modes: {
    armed: LogicalSwitch,
    startFlying: LogicalSwitch,
    endFlying: LogicalSwitch,
  }
}

export interface Segment {
  type: SegmentType;
  rows: SegmentItem[];
  startDate: Date;
  endDate: Date;
  duration: number;
}

export interface SegmentItem {
  Date: string,
  Thr: string,
  Time: string, // "12:00:26.600"
}
