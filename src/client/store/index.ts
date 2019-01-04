import { StateType, ActionType } from "typesafe-actions";
import { combineReducers } from "redux";
import { flightsReducer } from "../flights/reducer";
import { flightsSaga } from "../flights/sagas";

import * as FlightsAction from "../flights/actions";
import { all, fork } from "redux-saga/effects";

export const rootReducer = combineReducers({
  flights: flightsReducer
});

// Here we use `redux-saga` to trigger actions asynchronously.
export function* rootSaga() {
  yield all([fork(flightsSaga)]);
}

export type RootAction = ActionType<typeof FlightsAction>;
export type RootState = StateType<typeof rootReducer>;
