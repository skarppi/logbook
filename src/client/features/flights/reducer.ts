import { FlightDay, Flight } from "../../../shared/flights/types";
import { getType } from "typesafe-actions";

import * as actions from "./actions";
import { RootAction } from "../../app";

export type FlightsState = Readonly<{
  flightDays: FlightDay[];
  flights: { [key: string]: Flight };
  flightIds: string[];
}>;

const initialState: FlightsState = {
  flightDays: [],
  flights: {},
  flightIds: []
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

    default:
      return state;
  }
};
