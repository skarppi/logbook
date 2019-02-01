import { FlightDay, Flight } from "../../../shared/flights/types";
import { getType } from "typesafe-actions";

import * as batteryActions from "../batteries/actions";
import * as actions from "./actions";
import store from "../../app/store";
import { RootAction } from "../../app";

export type FlightsState = Readonly<{
  flightDays: FlightDay[];
  flights: { [key: string]: Flight };
  flightIds: string[];
  error?: string;
}>;

const initialState: FlightsState = {
  flightDays: [],
  flights: {},
  flightIds: [],
  error: null
};

function applyDefaults(flight: Flight) {
  if (!flight.notes) {
    flight.notes = {
      osd: "",
      location: "",
      journal: ""
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

    case getType(actions.changeFlightFields): {
      const id = action.payload["id"];
      const flight = state.flights[id];

      // merge old and new notes
      const notes = { ...flight.notes, ...action.payload["notes"] };

      // migrate deprecated fields
      delete notes["batteries"];
      delete notes["id"];
      delete notes["chargeFuel"];
      delete notes["chargeVoltage"];

      return {
        ...state,
        flights: {
          ...state.flights,
          [id]: { ...flight, ...action.payload, notes: notes }
        }
      };
    }

    case getType(actions.fetchFlight.request):
    case getType(actions.resetFlight.request):
    case getType(actions.updateFlight.request):
    case getType(actions.deleteFlight.request): {
      return {
        ...state,
        error: null
      };
    }

    case getType(actions.fetchFlight.success):
    case getType(actions.resetFlight.success):
    case getType(actions.updateFlight.success): {
      return {
        ...state,
        flights: {
          ...state.flights,
          [action.payload.id]: applyDefaults(action.payload)
        }
      };
    }

    case getType(actions.deleteFlight.success): {
      const flights = { ...state.flights };
      delete flights[action.payload.id];

      return {
        ...state,
        flights: flights,
        flightIds: state.flightIds.filter(id => id !== action.payload.id)
      };
    }

    case getType(batteryActions.insertBatteryCycle.failure):
    case getType(batteryActions.updateBatteryCycle.failure):
    case getType(batteryActions.deleteBatteryCycle.failure):
    case getType(actions.fetchFlight.failure):
    case getType(actions.resetFlight.failure):
    case getType(actions.updateFlight.failure):
    case getType(actions.deleteFlight.failure): {
      console.log(action.payload);
      return {
        ...state,
        error: action.payload
      };
    }

    default:
      return state;
  }
};
