import { Flight } from "../flights/types";

export interface Location {
  id?: number;
  name?: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
  flights?: {
    totalCount: number;
    nodes: Flight[];
  };
  __typename?: string;
}
