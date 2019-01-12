import { createAsyncAction } from "typesafe-actions";
import { Dashboard } from "../../shared/dashboard/types";
import { DashboardUnit } from "../../shared/dashboard";

export const fetchDashboard = createAsyncAction(
  "FETCH_DASHBOARD_REQUEST",
  "FETCH_DASHBOARD_SUCCESS",
  "FETCH_DASHBOARD_FAILURE"
)<DashboardUnit, Dashboard[], string>();
