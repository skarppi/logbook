import { getType } from "typesafe-actions";
import { fetchFlight } from "../flights/actions";
import * as actions from "./actions";
import { RootAction } from "../../app";
import { BatteryCycle, Battery } from "../../../shared/batteries/types";

export type BatteryCycleState = Readonly<{
  batteries: { [key: string]: Battery };
  cycles: { [key: string]: BatteryCycle };
}>;

const initialState: BatteryCycleState = {
  batteries: {},
  cycles: {}
};

export const batteriesReducer = function reducer(
  state: BatteryCycleState = initialState,
  action: RootAction
) {
  switch (action.type) {
    case getType(fetchFlight.success): {
      const cycles = {};
      action.payload.batteries.forEach(cycle => {
        cycles[cycle.id] = cycle;
      });

      return {
        ...state,
        cycles: cycles
      };
    }

    case getType(actions.fetchBatteries.success): {
      const batteries = {};
      action.payload.forEach(battery => {
        batteries[battery.id] = battery;
      });

      return {
        ...state,
        batteries: batteries
      };
    }

    case getType(actions.insertBattery.success):
    case getType(actions.updateBattery.success): {
      return {
        ...state,
        batteries: {
          ...state.batteries,
          [action.payload.id]: action.payload
        }
      };
    }

    case getType(actions.deleteBattery.success): {
      const batteries = { ...state.batteries };
      delete batteries[action.payload.id];
      return {
        ...state,
        batteries: batteries
      };
    }

    case getType(actions.insertBatteryCycle.success):
    case getType(actions.updateBatteryCycle.success): {
      return {
        ...state,
        cycles: {
          ...state.cycles,
          [action.payload.id]: action.payload
        }
      };
    }

    case getType(actions.deleteBatteryCycle.success): {
      const cycles = { ...state.cycles };
      delete cycles[action.payload.id];
      return {
        ...state,
        cycles: cycles
      };
    }

    default:
      return state;
  }
};
