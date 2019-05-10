import { FlightDay, Flight } from "../../../shared/flights/types";
import { getType } from "typesafe-actions";

import * as actions from "./actions";
import { RootAction } from "../../app";

export type FlightsState = Readonly<{
  flightDays: FlightDay[];
  flights: { [key: string]: Flight };
  flightIds: string[];
  locations: string[];
  videos: string[];
}>;

const initialState: FlightsState = {
  flightDays: [],
  flights: {},
  flightIds: [],
  locations: [],
  videos: []
};

/*
 * Reducer takes 2 arguments
 * state: The state of the reducer. By default initialState ( if there was no state provided)
 * action: Action to be handled. Since we are in flights reducer, action type is Action defined in our actions/flights file.
 */
export const flightsReducer = function reducer(
  state: FlightsState = initialState,
  action: RootAction
) {
  function normalize(flights: Flight[]) {
    const obj = {};
    flights.forEach(flight => {
      obj[flight.id] = flight;
    });
    return {
      flights: obj,
      flightIds: flights.map(f => f.id)
    };
  }

  switch (action.type) {
    case getType(actions.addFlights): {
      return {
        ...state,
        ...normalize(action.payload)
      };
    }

    // DAYS

    case getType(actions.fetchFlightDays.success): {
      return {
        ...state,
        flightDays: action.payload
      };
    }

    // FLIGHTS OF THE DAY

    case getType(actions.fetchFlights.request): {
      return {
        ...state,
        ...normalize([])
      };
    }
    case getType(actions.fetchFlights.success): {
      return {
        ...state,
        ...normalize(action.payload)
      };
    }

    // SINGLE FLIGHT

    case getType(actions.fetchLocations.success): {
      return {
        ...state,
        locations: action.payload
      };
    }

    case getType(actions.fetchVideos.success): {
      return {
        ...state,
        videos: action.payload
      };
    }

    default:
      return state;
  }
};
