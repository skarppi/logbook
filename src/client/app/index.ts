import { StateType, ActionType } from "typesafe-actions";
import { combineReducers } from "redux";
import { flightsReducer } from "../features/flights/reducer";
import { flightsSaga } from "../features/flights/sagas";
import { batteriesReducer } from "../features/batteries/reducer";
import { batteriesSaga } from "../features/batteries/sagas";
import { dashboardReducer } from "../features/dashboard/reducer";
import { dashboardSaga } from "../features/dashboard/sagas";
import { loadingReducer } from "../features/loading/reducer";

import * as FlightsAction from "../features/flights/actions";
import * as BatteriesAction from "../features/batteries/actions";
import * as DashboardAction from "../features/dashboard/actions";
import { all, fork } from "redux-saga/effects";

export const rootReducer = combineReducers({
  flights: flightsReducer,
  batteries: batteriesReducer,
  dashboard: dashboardReducer,
  loading: loadingReducer
});

// Here we use `redux-saga` to trigger actions asynchronously.
export function* rootSaga() {
  yield all([fork(flightsSaga), fork(batteriesSaga), fork(dashboardSaga)]);
}

export type RootAction = ActionType<
  typeof FlightsAction & typeof BatteriesAction & typeof DashboardAction
>;
export type RootState = StateType<typeof rootReducer>;
