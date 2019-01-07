import { createAsyncAction } from "typesafe-actions";
import { Dashboard } from "../../shared/Dashboard";

export const fetchDashboard = createAsyncAction(
  "FETCH_DASHBOARD_REQUEST",
  "FETCH_DASHBOARD_SUCCESS",
  "FETCH_DASHBOARD_FAILURE"
)<void, Dashboard[], string>();
