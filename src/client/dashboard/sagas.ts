import { all, call, fork, put, takeEvery } from "redux-saga/effects";
import * as actions from "./actions";
import { getApi } from "../utils/api-facade";

function* handleFetch(action) {
  try {
    const res = yield call(getApi, "dashboard", { unit: action.payload });

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

function* watchFetchRequest() {
  yield takeEvery(actions.fetchDashboard.request, handleFetch);
}

// We can also use `fork()` here to split our saga into multiple watchers.
export function* dashboardSaga() {
  yield all([fork(watchFetchRequest)]);
}
