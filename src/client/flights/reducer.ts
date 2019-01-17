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

function applyDefaults(flight: Flight) {
  if (!flight.notes) {
    flight.notes = {
      osd: "",
      location: "",
      batteries: [],
      journal: "",
      chargeVoltage: "",
      chargeFuel: ""
    };
  }
  return flight;
}

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
        flightsOfTheDay: action.payload
      };
    }

    // DAYS

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

    // FLIGHTS OF THE DAY

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

    // SINGLE FLIGHT

    case getType(actions.fetchFlight.request): {
      return {
        ...state,
        flight: applyDefaults(action.payload),
        isLoadingFlightDetails: true
      };
    }

    case getType(actions.updateFlightNotes): {
      const flightNotes = { ...state.flight.notes, ...action.payload };

      return {
        ...state,
        flight: { ...state.flight, notes: flightNotes },
        isLoadingFlightDetails: true
      };
    }

    case getType(actions.resetFlight.request):
    case getType(actions.deleteFlight.request): {
      return {
        ...state,
        isLoadingFlightDetails: true
      };
    }

    case getType(actions.fetchFlight.success):
    case getType(actions.resetFlight.success):
    case getType(actions.updateFlight.success): {
      return {
        ...state,
        flight: applyDefaults(action.payload),
        isLoadingFlightDetails: false
      };
    }

    case getType(actions.deleteFlight.success): {
      return {
        ...state,
        flight: null,
        isLoadingFlightDetails: false
      };
    }

    case getType(actions.fetchFlight.failure):
    case getType(actions.resetFlight.failure):
    case getType(actions.updateFlight.failure):
    case getType(actions.deleteFlight.failure): {
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
