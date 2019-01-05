import { createAsyncAction, createStandardAction } from "typesafe-actions";
import Flight from "../../shared/IFlight";

export const addFlights = createStandardAction("ADD_FLIGHTS")<Flight[]>();

export const fetchFlights = createAsyncAction(
  "FETCH_FLIGHTS_REQUEST",
  "FETCH_FLIGHTS_SUCCESS",
  "FETCH_FLIGHTS_FAILURE"
)<void, Flight[], string>();
