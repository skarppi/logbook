import { StateType, ActionType } from "typesafe-actions";
import { combineReducers } from "redux";
import { flightsReducer } from "../features/flights/reducer";
import { flightsSaga } from "../features/flights/sagas";
import { batteriesReducer } from "../features/batteries/reducer";
import { batteriesSaga } from "../features/batteries/sagas";
import { loadingReducer } from "../features/loading/reducer";

import * as FlightsAction from "../features/flights/actions";
import * as BatteriesAction from "../features/batteries/actions";
import { all, fork } from "redux-saga/effects";

import { connectRouter, RouterAction } from "connected-react-router";
import { rootReducer } from "./store";

export const createRootReducer = (history: History) =>
  combineReducers({
    router: connectRouter(history),
    flights: flightsReducer,
    batteries: batteriesReducer,
    loading: loadingReducer
  });

// Here we use `redux-saga` to trigger actions asynchronously.
export function* rootSaga() {
  yield all([fork(flightsSaga), fork(batteriesSaga)]);
}

export type RootAction = ActionType<
  typeof FlightsAction & typeof BatteriesAction
>;
export type RootState = StateType<typeof rootReducer>;
