import { getType } from "typesafe-actions";

import * as actions from "./actions";
import { RootAction } from "../store";
import { Dashboard } from "../../shared/idashboard";
import { DashboardUnit } from "../../shared/Dashboard";

export type DashboardState = Readonly<{
  graph: Dashboard;
  unit: DashboardUnit;
  isLoading: false;
}>;

const initialState: DashboardState = {
  graph: { labels: [], max: 0, datasets: [] },
  unit: DashboardUnit.month,
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
        unit: action.payload,
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

    default:
      return state;
  }
};
