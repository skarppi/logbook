import { StateType, ActionType } from "typesafe-actions";
import { combineReducers } from "redux";
import { flightsReducer } from "../flights/reducer";
import { flightsSaga } from "../flights/sagas";
import { batteriesReducer } from "../batteries/reducer";
import { batteriesSaga } from "../batteries/sagas";
import { dashboardReducer } from "../dashboard/reducer";
import { dashboardSaga } from "../dashboard/sagas";

import * as FlightsAction from "../flights/actions";
import * as BatteriesAction from "../batteries/actions";
import * as DashboardAction from "../dashboard/actions";
import { all, fork } from "redux-saga/effects";

export const rootReducer = combineReducers({
  flights: flightsReducer,
  batteries: batteriesReducer,
  dashboard: dashboardReducer
});

// Here we use `redux-saga` to trigger actions asynchronously.
export function* rootSaga() {
  yield all([fork(flightsSaga), fork(batteriesSaga), fork(dashboardSaga)]);
}

export type RootAction = ActionType<
  typeof FlightsAction & typeof BatteriesAction & typeof DashboardAction
>;
export type RootState = StateType<typeof rootReducer>;
