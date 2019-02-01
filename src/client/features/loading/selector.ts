import { RootState, RootAction } from "../../app";
import { AsyncActionBuilder } from "typesafe-actions/dist/create-async-action";
import { getType } from "typesafe-actions";

const type = (action: AsyncActionBuilder<any, any, any, any, any, any>) => {
  const t = getType(action.request) as string;
  return t.substr(0, t.lastIndexOf("_"));
};

export const isLoading = (
  state: RootState,
  actions: AsyncActionBuilder<any, any, any, any, any, any>[]
) => {
  if (!state.loading) {
    return;
  }

  return actions.find(action => state.loading[type(action)]) !== undefined;
};
