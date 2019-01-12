export interface Flight {
  id: string;
  plane: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  readyTime: number;
  flightTime: number;
  status?: any;
}

export interface FlightDay {
  date: Date;
  flights: number;
  planes: string[];
  duration: number;
  readyTime: number;
  flightTime: number;
}
