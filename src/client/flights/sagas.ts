import { all, call, fork, put, takeEvery } from "redux-saga/effects";
import * as actions from "./actions";
import { getApi } from "../utils/api-facade";

function* handleFetch() {
  try {
    const res = yield call(getApi, "flights");

    if (res.error) {
      yield put(actions.fetchFlights.failure(res.error));
    } else {
      yield put(actions.fetchFlights.success(res));
    }
  } catch (err) {
    if (err instanceof Error) {
      yield put(actions.fetchFlights.failure(err.stack!));
    } else {
      yield put(actions.fetchFlights.failure("An unknown error occured."));
    }
  }
}

function* watchFetchRequest() {
  yield takeEvery(actions.fetchFlights.request, handleFetch);
}

// We can also use `fork()` here to split our saga into multiple watchers.
export function* flightsSaga() {
  yield all([fork(watchFetchRequest)]);
}
