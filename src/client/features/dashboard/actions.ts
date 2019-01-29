import { createAsyncAction, createStandardAction } from "typesafe-actions";
import { Dashboard, DashboardQuery } from "../../../shared/dashboard/types";
import { DashboardUnit } from "../../../shared/dashboard";

export const changeDashboardUnit = createStandardAction(
  "CHANGE_DASHBOARD_UNIT"
)<DashboardUnit>();

export const changeDashboardSize = createStandardAction(
  "CHANGE_DASHBOARD_SIZE"
)<number>();

export const fetchDashboard = createAsyncAction(
  "FETCH_DASHBOARD_REQUEST",
  "FETCH_DASHBOARD_SUCCESS",
  "FETCH_DASHBOARD_FAILURE"
)<DashboardQuery, Dashboard[], string>();
