import { all, fork, takeEvery, select, takeLatest } from "redux-saga/effects";
import * as actions from "./actions";
import {
  handleCall,
  putApi,
  getVideosApi
} from "../../utils/api-facade";
import { formatDate } from "../../../shared/utils/date";
import { Flight } from "../../../shared/flights/types";

function* handleFetchFlightDays() {
  return yield handleCall(actions.fetchFlightDays, "flights");
}

function* handleFetchFlights(action) {
  return yield handleCall(actions.fetchFlights, "flights/" + action.payload);
}

function pathForFlight(flight: Flight) {
  return "flights/" + formatDate(flight.startDate) + "/" + flight.id;
}

function* handleResetFlight(action) {
  return yield handleCall(
    actions.resetFlight,
    pathForFlight(action.payload) + "/reset",
    putApi
  );
}

function* handleFetchLocations() {
  return yield handleCall(actions.fetchLocations, "locations/");
}

function* handleFetchVideos(action) {
  return yield handleCall(
    actions.fetchVideos,
    "",
    getVideosApi,
    action.payload
  );
}

function* watchFetchFlightDaysRequest() {
  yield takeEvery(actions.fetchFlightDays.request, handleFetchFlightDays);
}

function* watchFetchFlightsRequest() {
  yield takeEvery(actions.fetchFlights.request, handleFetchFlights);
}

function* watchResetFlightRequest() {
  yield takeEvery(actions.resetFlight.request, handleResetFlight);
}

function* watchFetchLocationsRequest() {
  yield takeEvery(actions.fetchLocations.request, handleFetchLocations);
}

function* watchFetchVideosRequest() {
  yield takeEvery(actions.fetchVideos.request, handleFetchVideos);
}

// We can also use `fork()` here to split our saga into multiple watchers.
export function* flightsSaga() {
  yield all([
    fork(watchFetchFlightDaysRequest),
    fork(watchFetchFlightsRequest),
    fork(watchResetFlightRequest),
    fork(watchFetchLocationsRequest),
    fork(watchFetchVideosRequest)
  ]);
}
