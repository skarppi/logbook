import { Flight } from "../flights/types";

export interface Location {
  id?: number;
  name?: string;
  latitude?: number,
  longitude?: number,
  flights?: {
    totalCount: number,
    nodes: Flight[]
  }
}