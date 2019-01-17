import {
  all,
  call,
  fork,
  put,
  takeEvery,
  select,
  takeLatest
} from "redux-saga/effects";
import { delay } from "redux-saga";
import * as actions from "./actions";
import { getApi, deleteApi, putApi } from "../utils/api-facade";
import { formatDate } from "../../shared/utils/date";
import { Flight } from "../../shared/flights/types";
import { getFlight } from "./selectors";

function* handleCall(action, path, api = getApi, body?: any) {
  try {
    const res = yield call(api, path, body);

    if (res.error) {
      yield put(action.failure(res.error));
    } else {
      yield put(action.success(res));
    }
  } catch (err) {
    if (err instanceof Error) {
      yield put(action.failure(err.stack!));
    } else {
      yield put(action.failure("An unknown error occured."));
    }
  }
}

function* handleFetchFlights() {
  return yield handleCall(actions.fetchFlights, "flights");
}

function* handleFetchFlightsPerDay(action) {
  return yield handleCall(
    actions.fetchFlightsPerDay,
    "flights/" + action.payload
  );
}

function pathForFlight(flight: Flight) {
  return "flights/" + formatDate(flight.startDate) + "/" + flight.id;
}

function* handleFetchFlight(action) {
  return yield handleCall(actions.fetchFlight, pathForFlight(action.payload));
}

function* handleResetFlight(action) {
  return yield handleCall(
    actions.resetFlight,
    pathForFlight(action.payload) + "/reset",
    putApi
  );
}

function* handleUpdateFlight() {
  yield delay(1000);

  let flight = yield select(getFlight);
  delete flight["segments"];

  return yield handleCall(
    actions.updateFlight,
    pathForFlight(flight),
    putApi,
    flight
  );
}

function* handledeleteFlight(action) {
  return yield handleCall(
    actions.deleteFlight,
    pathForFlight(action.payload),
    deleteApi
  );
}

function* watchFetchFlightsRequest() {
  yield takeEvery(actions.fetchFlights.request, handleFetchFlights);
}

function* watchFetchFlightsPerDayRequest() {
  yield takeEvery(actions.fetchFlightsPerDay.request, handleFetchFlightsPerDay);
}

function* watchFetchFlightRequest() {
  yield takeEvery(actions.fetchFlight.request, handleFetchFlight);
}

function* watchResetFlightRequest() {
  yield takeEvery(actions.resetFlight.request, handleResetFlight);
}

function* watchDeleteFlightRequest() {
  yield takeEvery(actions.deleteFlight.request, handledeleteFlight);
}

function* watchUpdateFlightRequests() {
  yield takeLatest(actions.updateFlightNotes, handleUpdateFlight);
}

// We can also use `fork()` here to split our saga into multiple watchers.
export function* flightsSaga() {
  yield all([
    fork(watchFetchFlightsRequest),
    fork(watchFetchFlightsPerDayRequest),
    fork(watchFetchFlightRequest),
    fork(watchResetFlightRequest),
    fork(watchUpdateFlightRequests),
    fork(watchDeleteFlightRequest)
  ]);
}
