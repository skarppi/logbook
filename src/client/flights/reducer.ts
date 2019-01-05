import Flight from "../../shared/IFlight";
import { getType } from "typesafe-actions";

import * as actions from "./actions";
import { RootAction } from "../store";

export type FlightsState = Readonly<{
  flights: Flight[];
  isLoading: false;
}>;

const initialState: FlightsState = {
  flights: [],
  isLoading: false
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
      const flights = action.payload;

      return {
        ...state,
        flights: [
          ...flights,
          ...state.flights.filter(
            existing => !flights.find(uploaded => uploaded.id === existing.id)
          )
        ]
      };
    }

    case getType(actions.fetchFlights.request): {
      return {
        ...state,
        isLoading: true
      };
    }
    case getType(actions.fetchFlights.success): {
      return {
        ...state,
        flights: action.payload,
        isLoading: false
      };
    }
    case getType(actions.fetchFlights.failure): {
      console.log(action.payload);
      return {
        ...state,
        isLoading: false
      };
    }

    default:
      return state;
  }
};
