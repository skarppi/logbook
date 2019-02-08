import {
  all,
  fork,
  takeEvery,
  takeLatest,
  select,
  put
} from "redux-saga/effects";
import * as actions from "./actions";
import { fetchFlight } from "../flights/actions";
import { handleCall, deleteApi, putApi, postApi } from "../../utils/api-facade";
import { BatteryCycle, Battery } from "../../../shared/batteries/types";
import { getFlight } from "../flights/selectors";

function pathForBatteries(battery: Battery) {
  return "batteries/" + ((battery && battery.id) || "");
}

function pathForBatteryCycles(cycle: BatteryCycle) {
  return "batteries/cycles/" + ((cycle && cycle.id) || "");
}

function* updateFlight(cycle: BatteryCycle) {
  let flight = yield select(getFlight, cycle.flightId);
  yield put(fetchFlight.request(flight));
}

function* handleFetchBatteries(action) {
  return yield handleCall(actions.fetchBatteries, pathForBatteries(null));
}

// Single battery

function* handleInsertBattery(action) {
  const inserted = yield handleCall(
    actions.insertBattery,
    pathForBatteries(null),
    postApi,
    action.payload,
    inserted => "/batteries/" + inserted.id
  );
  return inserted;
}

function* handleUpdateBattery(action) {
  return yield handleCall(
    actions.updateBattery,
    pathForBatteries(action.payload),
    putApi,
    action.payload
  );
}

function* handleDeleteBattery(action) {
  return yield handleCall(
    actions.deleteBattery,
    pathForBatteries(action.payload),
    deleteApi,
    null,
    _ => "/batteries"
  );
}

// Cycles

function* handleInsertBatteryCycle(action) {
  const inserted = yield handleCall(
    actions.insertBatteryCycle,
    pathForBatteryCycles(null),
    postApi,
    action.payload
  );

  // if (action.payload.state !== BatteryState.discharged) {
  //   // refresh list
  //   yield put(actions.fetchBatteries.request());
  // }
  updateFlight(action.payload);
  return inserted;
}

function* handleUpdateBatteryCycle(action) {
  const updated = yield handleCall(
    actions.updateBatteryCycle,
    pathForBatteryCycles(action.payload),
    putApi,
    action.payload
  );

  updateFlight(action.payload);

  return updated;
}

function* handleDeleteBatteryCycle(action) {
  const deleted = yield handleCall(
    actions.deleteBatteryCycle,
    pathForBatteryCycles(action.payload),
    deleteApi
  );
  updateFlight(action.payload);
  return deleted;
}

// Batteries

function* watchFetchBatteriesRequest() {
  yield takeLatest(actions.fetchBatteries.request, handleFetchBatteries);
}

// Single battery

function* watchInsertBatteryRequest() {
  yield takeEvery(actions.insertBattery.request, handleInsertBattery);
}

function* watchUpdateBatteryRequest() {
  yield takeLatest(actions.updateBattery.request, handleUpdateBattery);
}

function* watchDeleteBatteryRequest() {
  yield takeEvery(actions.deleteBattery.request, handleDeleteBattery);
}

// Cycles

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
    fork(watchInsertBatteryRequest),
    fork(watchUpdateBatteryRequest),
    fork(watchDeleteBatteryRequest),
    fork(watchInsertBatteryCycleRequest),
    fork(watchUpdateBatteryCycleRequest),
    fork(watchDeleteBatteryCycleRequest)
  ]);
}
