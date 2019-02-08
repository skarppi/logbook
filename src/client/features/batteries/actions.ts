import { createAsyncAction } from "typesafe-actions";
import { BatteryCycle, Battery } from "../../../shared/batteries/types";

export const fetchBatteries = createAsyncAction(
  "FETCH_BATTERIES_REQUEST",
  "FETCH_BATTERIES_SUCCESS",
  "FETCH_BATTERIES_FAILURE"
)<void, Battery[], string>();

export const insertBattery = createAsyncAction(
  "INSERT_BATTERY_REQUEST",
  "INSERT_BATTERY_SUCCESS",
  "INSERT_BATTERY_FAILURE"
)<Battery, Battery, string>();

export const updateBattery = createAsyncAction(
  "UPDATE_BATTERY_REQUEST",
  "UPDATE_BATTERY_SUCCESS",
  "UPDATE_BATTERY_FAILURE"
)<Battery, Battery, string>();

export const deleteBattery = createAsyncAction(
  "DELETE_BATTERY_REQUEST",
  "DELETE_BATTERY_SUCCESS",
  "DELETE_BATTERY_FAILURE"
)<Battery, Battery, string>();

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
