import { getType } from "typesafe-actions";
import { fetchFlight } from "../flights/actions";
import * as actions from "./actions";
import { RootAction } from "../../app";
import { BatteryCycle, Battery } from "../../../shared/batteries/types";

export type BatteryCycleState = Readonly<{
  batteries: { [key: string]: Battery };
  cycles: { [key: string]: BatteryCycle };
  isLoadingBatteries: boolean;
}>;

const initialState: BatteryCycleState = {
  batteries: {},
  cycles: {},
  isLoadingBatteries: false
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
        batteries: batteries,
        isLoadingBatteries: false
      };
    }

    case getType(actions.fetchBatteries.request):
    case getType(actions.insertBatteryCycle.request):
    case getType(actions.updateBatteryCycle.request):
    case getType(actions.deleteBatteryCycle.request): {
      return {
        ...state,
        isLoadingBatteries: true
      };
    }

    case getType(actions.insertBatteryCycle.success):
    case getType(actions.updateBatteryCycle.success): {
      return {
        ...state,
        cycles: {
          ...state.cycles,
          [action.payload.id]: action.payload
        },
        isLoadingBatteries: false
      };
    }

    case getType(actions.deleteBatteryCycle.success): {
      const cycles = { ...state.cycles };
      delete cycles[action.payload.id];
      return {
        ...state,
        cycles: cycles,
        isLoadingBatteries: false
      };
    }

    case getType(actions.fetchBatteries.failure):
    case getType(actions.insertBatteryCycle.failure):
    case getType(actions.updateBatteryCycle.failure):
    case getType(actions.deleteBatteryCycle.failure): {
      console.log(action.payload);
      return {
        ...state,
        isLoadingBatteries: false
      };
    }

    default:
      return state;
  }
};
