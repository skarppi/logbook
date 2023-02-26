import { SegmentType } from "./index";
import { BatteryCycle } from "../batteries/types";
import { Plane } from "../planes/types";
import { Location } from "../locations/types";

export interface Flight {
  id: string;
  planeId: string;
  plane: Plane;
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
  stats?: FlightStats;
  locationId?: number;
  location?: Location;
  favorite?: number;
  batteryCycles?: {
    nodes: BatteryCycle[];
  };
}

export interface FlightNotes {
  osd?: string;
  journal?: string;
}

export interface FlightStats {
  zeroHeight?: number;
  launchHeight?: number;
  maxHeight?: number;
  slopes?: FlightSlope[];
}

export interface FlightSlope {
  minHeight?: number;
  maxHeight?: number;
  direction?: number; // positive up, negative down
}

export interface FlightDay {
  date: Date;
  flights: number;
  planes: string[];
  duration: number;
  armedTime: number;
  flightTime: number;
}

export interface Segment {
  type: SegmentType;
  rows: SegmentItem[];
  startDate: Date;
  endDate: Date;
  duration: number;
}

export interface SegmentItem {
  // known values
  Date: string;
  Thr: string;
  Time: string; // "12:00:26.600"

  // computed values
  timestamp: Date;
  alt?: number;

  // the rest
  [key: string]: any;
}
