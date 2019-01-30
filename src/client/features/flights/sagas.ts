import { all, fork, takeEvery, select, takeLatest } from "redux-saga/effects";
import { delay } from "redux-saga";
import * as actions from "./actions";
import { handleCall, deleteApi, putApi } from "../../utils/api-facade";
import { formatDate } from "../../../shared/utils/date";
import { Flight } from "../../../shared/flights/types";
import { getFlight } from "./selectors";

function* handleFetchFlightDays() {
  return yield handleCall(actions.fetchFlightDays, "flights");
}

function* handleFetchFlights(action) {
  return yield handleCall(actions.fetchFlights, "flights/" + action.payload);
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

function* handleUpdateFlight(action) {
  yield delay(1000);

  let flight = yield select(getFlight, action.payload.id);

  // do not upload raw data
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

function* watchFetchFlightDaysRequest() {
  yield takeEvery(actions.fetchFlightDays.request, handleFetchFlightDays);
}

function* watchFetchFlightsRequest() {
  yield takeEvery(actions.fetchFlights.request, handleFetchFlights);
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

function* watchUpdateFlight() {
  yield takeLatest(actions.changeFlightFields, handleUpdateFlight);
}

// We can also use `fork()` here to split our saga into multiple watchers.
export function* flightsSaga() {
  yield all([
    fork(watchFetchFlightDaysRequest),
    fork(watchFetchFlightsRequest),
    fork(watchFetchFlightRequest),
    fork(watchResetFlightRequest),
    fork(watchUpdateFlight),
    fork(watchDeleteFlightRequest)
  ]);
}
