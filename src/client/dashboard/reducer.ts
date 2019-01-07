import { getType } from "typesafe-actions";

import * as actions from "./actions";
import { RootAction } from "../store";
import { Dashboard } from "../../shared/Dashboard";

export type DashboardState = Readonly<{
  graph: Dashboard;
  isLoading: false;
}>;

const initialState: DashboardState = {
  graph: { labels: [], datasets: [] },
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

    default:
      return state;
  }
};
