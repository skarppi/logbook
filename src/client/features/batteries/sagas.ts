import {
  all,
  fork,
  takeEvery,
  takeLatest,
  select,
  put
} from "redux-saga/effects";
import * as actions from "./actions";
import { handleCall, deleteApi, putApi, postApi } from "../../utils/api-facade";
import { BatteryCycle, Battery } from "../../../shared/batteries/types";
import { BatteryState } from "../../../shared/batteries";

function pathForBatteries(battery: Battery) {
  return "batteries/" + ((battery && battery.id) || "");
}

function pathForBatteryCycles(cycle: BatteryCycle) {
  return "batteries/cycles/" + ((cycle && cycle.id) || "");
}

function* handleFetchBatteries(action) {
  return yield handleCall(actions.fetchBatteries, pathForBatteries(null));
}

function* handleInsertBatteryCycle(action) {
  const inserted = yield handleCall(
    actions.insertBatteryCycle,
    pathForBatteryCycles(null),
    postApi,
    action.payload
  );

  if (action.payload.state !== BatteryState.discharged) {
    // refresh list
    yield put(actions.fetchBatteries.request());
  }
  return inserted;
}

function* handleUpdateBatteryCycle(action) {
  return yield handleCall(
    actions.updateBatteryCycle,
    pathForBatteryCycles(action.payload),
    putApi,
    action.payload
  );
}

function* handleDeleteBatteryCycle(action) {
  return yield handleCall(
    actions.deleteBatteryCycle,
    pathForBatteryCycles(action.payload),
    deleteApi
  );
}

function* watchFetchBatteriesRequest() {
  yield takeLatest(actions.fetchBatteries.request, handleFetchBatteries);
}

function* watchInsertBatteryCycleRequest() {
  yield takeEvery(actions.insertBatteryCycle.request, handleInsertBatteryCycle);
}

function* watchUpdateBatteryCycleRequest() {
  yield takeLatest(
    actions.updateBatteryCycle.request,
    handleUpdateBatteryCycle
  );
}

function* watchDeleteBatteryCycleRequest() {
  yield takeEvery(actions.deleteBatteryCycle.request, handleDeleteBatteryCycle);
}

export function* batteriesSaga() {
  yield all([
    fork(watchFetchBatteriesRequest),
    fork(watchInsertBatteryCycleRequest),
    fork(watchUpdateBatteryCycleRequest),
    fork(watchDeleteBatteryCycleRequest)
  ]);
}
