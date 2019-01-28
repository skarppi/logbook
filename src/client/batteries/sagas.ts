import { all, fork, takeEvery, takeLatest, select } from "redux-saga/effects";
import * as actions from "./actions";
import { handleCall, deleteApi, putApi, postApi } from "../utils/api-facade";
import { BatteryCycle } from "../../shared/batteries/types";

function pathForBatteries(battery: BatteryCycle) {
  return "batteries/cycles/" + ((battery && battery.id) || "");
}

function* handleInsertBatteryCycle(action) {
  return yield handleCall(
    actions.insertBatteryCycle,
    pathForBatteries(null),
    postApi,
    action.payload
  );
}

function* handleUpdateBatteries(action) {
  return yield handleCall(
    actions.updateBatteryCycle,
    pathForBatteries(action.payload),
    putApi,
    action.payload
  );
}

function* handleDeleteBatteries(action) {
  return yield handleCall(
    actions.deleteBatteryCycle,
    pathForBatteries(action.payload),
    deleteApi
  );
}

function* watchInsertBatteryCycleRequest() {
  yield takeEvery(actions.insertBatteryCycle.request, handleInsertBatteryCycle);
}

function* watchUpdateBatteryCycleRequest() {
  yield takeLatest(actions.updateBatteryCycle.request, handleUpdateBatteries);
}

function* watchDeleteBatteryCycleRequest() {
  yield takeEvery(actions.deleteBatteryCycle.request, handleDeleteBatteries);
}

export function* batteriesSaga() {
  yield all([
    fork(watchInsertBatteryCycleRequest),
    fork(watchUpdateBatteryCycleRequest),
    fork(watchDeleteBatteryCycleRequest)
  ]);
}
