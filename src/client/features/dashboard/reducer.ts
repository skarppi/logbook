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
  query: { unit: DashboardUnit.month, size: 12 },
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
      const size = action.payload === DashboardUnit.day ? 30 :
        (action.payload === DashboardUnit.month ? 12  : 5) // years
      return {
        ...state,
        query: { unit: action.payload, size: size }
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
