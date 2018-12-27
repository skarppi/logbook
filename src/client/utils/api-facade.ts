import axios from "axios";
import { IFlight } from "../../shared/IFlight";

export function loadFlightsAPI() {
  return axios.get(`/api/flights`).then(res => res.data as IFlight[]);
}
