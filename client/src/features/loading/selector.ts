import { RootState } from "../../app";
import { getType } from "typesafe-actions";
import { ActionCreator } from "typesafe-actions/dist/types";

export const isLoading = (
  state: RootState,
  actions: ActionCreator<any>[]
): boolean => {
  return actions.find(action => state.loading[getType(action)]) !== undefined;
};

export const getError = (
  state: RootState,
  actions: ActionCreator<any>[]
): string => {
  const action = actions.find(action => state.loading[getType(action)]);
  if (action) {
    return state.loading[getType(action)];
  }
};
