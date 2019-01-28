import { createAsyncAction } from "typesafe-actions";
import { BatteryCycle } from "../../shared/batteries/types";

export const insertBatteryCycle = createAsyncAction(
  "INSERT_BATTERYCYCLE_REQUEST",
  "INSERT_BATTERYCYCLE_SUCCESS",
  "INSERT_BATTERYCYCLE_FAILURE"
)<BatteryCycle, BatteryCycle, string>();

export const updateBatteryCycle = createAsyncAction(
  "UPDATE_BATTERYCYCLE_REQUEST",
  "UPDATE_BATTERYCYCLE_SUCCESS",
  "UPDATE_BATTERYCYCLE_FAILURE"
)<BatteryCycle, BatteryCycle, string>();

export const deleteBatteryCycle = createAsyncAction(
  "DELETE_BATTERYCYCLE_REQUEST",
  "DELETE_BATTERYCYCLE_SUCCESS",
  "DELETE_BATTERYCYCLE_FAILURE"
)<BatteryCycle, BatteryCycle, string>();
