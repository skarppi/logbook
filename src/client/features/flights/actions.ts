import { createAsyncAction, createStandardAction } from "typesafe-actions";
import { Flight, FlightDay } from "../../../shared/flights/types";

export const addFlights = createStandardAction("ADD_FLIGHTS")<Flight[]>();

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

export const fetchLocations = createAsyncAction(
  "FETCH_FLIGHTLOCATIONS_REQUEST",
  "FETCH_FLIGHTLOCATIONS_SUCCESS",
  "FETCH_FLIGHTLOCATIONS_FAILURE"
)<void, string[], string>();

export const fetchVideos = createAsyncAction(
  "FETCH_FLIGHTVIDEOS_REQUEST",
  "FETCH_FLIGHTVIDEOS_SUCCESS",
  "FETCH_FLIGHTVIDEOS_FAILURE"
)<object, string[], string>();
