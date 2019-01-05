export default interface IFlight {
  id: string;
  plane: string;
  startDate: Date;
  endDate?: Date;
  flightTime: number;
  duration: number;
  status?: any;
}
