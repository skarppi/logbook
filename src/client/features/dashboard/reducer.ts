import { getType } from "typesafe-actions";

import * as actions from "./actions";
import { RootAction } from "../../app";
import { Dashboard, DashboardQuery } from "../../../shared/dashboard/types";
import { DashboardUnit } from "../../../shared/dashboard";

export type DashboardState = Readonly<{
  graph: Dashboard;
  query: DashboardQuery;
  isLoading: false;
}>;

const initialState: DashboardState = {
  graph: { labels: [], max: 0, datasets: [] },
  query: { unit: DashboardUnit.month, size: 3 },
  isLoading: false
};

export const dashboardReducer = function reducer(
  state: DashboardState = initialState,
  action: RootAction
) {
  switch (action.type) {
    case getType(actions.fetchDashboard.request): {
      return {
        ...state,
        isLoading: true
      };
    }
    case getType(actions.fetchDashboard.success): {
      return {
        ...state,
        graph: action.payload,
        isLoading: false
      };
    }
    case getType(actions.fetchDashboard.failure): {
      return {
        ...state,
        isLoading: false
      };
    }

    case getType(actions.changeDashboardUnit): {
      return {
        ...state,
        query: { ...state.query, unit: action.payload }
      };
    }

    case getType(actions.changeDashboardSize): {
      return {
        ...state,
        query: { ...state.query, size: action.payload }
      };
    }

    default:
      return state;
  }
};
