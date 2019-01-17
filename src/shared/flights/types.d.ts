import { SegmentType } from "./index";

export interface Flight {
  id: string;
  plane: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  armedTime: number;
  flightTime: number;
  segments: Segment[];
  notes?: FlightNotes;
}

export interface FlightNotes {
  osd?: string;
  location?: string;
  batteries?: string[];
  journal?: string;
  chargeVoltage?: string;
  chargeFuel?: string;
}

export interface FlightDay {
  date: Date;
  flights: number;
  planes: string[];
  duration: number;
  armedTime: number;
  flightTime: number;
}

export interface Plane {
  batteries: string[];
}

export interface Segment {
  type: SegmentType;
  rows: SegmentItem[];
  startDate: Date;
  endDate: Date;
  duration: number;
}

export interface SegmentItem {}
