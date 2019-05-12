import { createAsyncAction, createStandardAction } from "typesafe-actions";
import { Flight, FlightDay } from "../../../shared/flights/types";

export const fetchFlightDays = createAsyncAction(
  "FETCH_FLIGHTDAYS_REQUEST",
  "FETCH_FLIGHTDAYS_SUCCESS",
  "FETCH_FLIGHTDAYS_FAILURE"
)<void, FlightDay[], string>();

export const fetchFlights = createAsyncAction(
  "FETCH_FLIGHTS_REQUEST",
  "FETCH_FLIGHTS_SUCCESS",
  "FETCH_FLIGHTS_FAILURE"
)<string, Flight[], string>();

export const resetFlight = createAsyncAction(
  "RESET_FLIGHTDETAILS_REQUEST",
  "RESET_FLIGHTDETAILS_SUCCESS",
  "RESET_FLIGHTDETAILS_FAILURE"
)<Flight, Flight, string>();
