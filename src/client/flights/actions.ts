import { createAsyncAction, createStandardAction } from "typesafe-actions";
import { Flight, FlightDay } from "../../shared/flights/types";

export const addFlights = createStandardAction("ADD_FLIGHTS")<Flight[]>();

export const fetchFlights = createAsyncAction(
  "FETCH_FLIGHTS_REQUEST",
  "FETCH_FLIGHTS_SUCCESS",
  "FETCH_FLIGHTS_FAILURE"
)<void, FlightDay[], string>();

export const fetchFlightsPerDay = createAsyncAction(
  "FETCH_FLIGHTSPERDAY_REQUEST",
  "FETCH_FLIGHTSPERDAY_SUCCESS",
  "FETCH_FLIGHTSPERDAY_FAILURE"
)<string, Flight[], string>();

export const fetchFlight = createAsyncAction(
  "FETCH_FLIGHTDETAILS_REQUEST",
  "FETCH_FLIGHTDETAILS_SUCCESS",
  "FETCH_FLIGHTDETAILS_FAILURE"
)<Flight, Flight, string>();

export const resetFlight = createAsyncAction(
  "RESET_FLIGHTDETAILS_REQUEST",
  "RESET_FLIGHTDETAILS_SUCCESS",
  "RESET_FLIGHTDETAILS_FAILURE"
)<Flight, Flight, string>();

export const deleteFlight = createAsyncAction(
  "DELETE_FLIGHTDETAILS_REQUEST",
  "DELETE_FLIGHTDETAILS_SUCCESS",
  "DELETE_FLIGHTDETAILS_FAILURE"
)<Flight, string, string>();
