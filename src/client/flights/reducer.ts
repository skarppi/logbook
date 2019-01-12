import { FlightDay, Flight } from "../../shared/flights/types";
import { getType } from "typesafe-actions";

import * as actions from "./actions";
import { RootAction } from "../store";

export type FlightsState = Readonly<{
  flightDays: FlightDay[];
  isLoadingFlightDays: boolean;
  flightsOfTheDay: Flight[];
  isLoadingFlightsOfTheDay: boolean;
  flight: Flight;
  isLoadingFlightDetails: boolean;
}>;

const initialState: FlightsState = {
  flightDays: [],
  isLoadingFlightDays: false,
  flightsOfTheDay: [],
  isLoadingFlightsOfTheDay: false,
  flight: null,
  isLoadingFlightDetails: false
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
  switch (action.type) {
    case getType(actions.addFlights): {
      return {
        ...state,
        flightDays: {
          upload: action.payload,
          ...state.flightDays
        }
      };
    }

    case getType(actions.fetchFlights.request): {
      return {
        ...state,
        isLoadingFlightDays: true
      };
    }
    case getType(actions.fetchFlights.success): {
      return {
        ...state,
        flightDays: action.payload,
        isLoadingFlightDays: false
      };
    }
    case getType(actions.fetchFlights.failure): {
      console.log(action.payload);
      return {
        ...state,
        isLoadingFlightDays: false
      };
    }

    case getType(actions.fetchFlightsPerDay.request): {
      return {
        ...state,
        flightsOfTheDay: [],
        isLoadingFlightsOfTheDay: true
      };
    }
    case getType(actions.fetchFlightsPerDay.success): {
      return {
        ...state,
        flightsOfTheDay: action.payload,
        isLoadingFlightsOfTheDay: false
      };
    }
    case getType(actions.fetchFlightsPerDay.failure): {
      console.log(action.payload);
      return {
        ...state,
        isLoadingFlightsOfTheDay: false
      };
    }

    case getType(actions.fetchFlight.request): {
      return {
        ...state,
        flight: action.payload,
        isLoadingFlightDetails: true
      };
    }
    case getType(actions.fetchFlight.success): {
      return {
        ...state,
        flight: action.payload,
        isLoadingFlightDetails: false
      };
    }
    case getType(actions.fetchFlight.failure): {
      console.log(action.payload);
      return {
        ...state,
        isLoadingFlightDetails: false
      };
    }

    default:
      return state;
  }
};
