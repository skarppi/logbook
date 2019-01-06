export default interface IFlight {
  id: string;
  plane: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  readyTime: number;
  flightTime: number;
  status?: any;
}
