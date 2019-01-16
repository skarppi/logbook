import {
  all,
  call,
  fork,
  put,
  takeEvery,
  select,
  takeLatest
} from "redux-saga/effects";
import * as actions from "./actions";
import { getQuery } from "./selectors";
import { getApi } from "../utils/api-facade";

function* handleFetch(action) {
  try {
    const res = yield call(getApi, "dashboard", action.payload);

    if (res.error) {
      yield put(actions.fetchDashboard.failure(res.error));
    } else {
      yield put(actions.fetchDashboard.success(res));
    }
  } catch (err) {
    if (err instanceof Error) {
      yield put(actions.fetchDashboard.failure(err.stack!));
    } else {
      yield put(actions.fetchDashboard.failure("An unknown error occured."));
    }
  }
}

function* handleChangeQuery() {
  let query = yield select(getQuery);
  console.log(query);
  yield put(actions.fetchDashboard.request(query));
}

function* watchFetchRequest() {
  yield takeLatest(actions.fetchDashboard.request, handleFetch);
}

function* watchChangeUnit() {
  yield takeLatest(actions.changeDashboardUnit, handleChangeQuery);
}

function* watchChangeSize() {
  yield takeLatest(actions.changeDashboardSize, handleChangeQuery);
}

// We can also use `fork()` here to split our saga into multiple watchers.
export function* dashboardSaga() {
  yield all([
    fork(watchFetchRequest),
    fork(watchChangeUnit),
    fork(watchChangeSize)
  ]);
}
