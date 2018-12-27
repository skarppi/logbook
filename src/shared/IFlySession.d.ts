export interface IFlySession {
  name: string;
  plane: string;
  startDate: Date;
  endDate?: Date;
  flightTime: number;
  duration: number;
}
