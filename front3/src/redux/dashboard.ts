// src/redux/dashboard.ts

import type { DashboardData } from "../types/dashboard";

/******************************* TYPES *******************************************/

interface DashboardState {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
}

interface LoadDashboardAction {
  type: typeof LOAD_DASHBOARD;
  payload: DashboardData;
}

interface SetDashboardLoadingAction {
  type: typeof SET_DASHBOARD_LOADING;
  payload: boolean;
}

interface SetDashboardErrorAction {
  type: typeof SET_DASHBOARD_ERROR;
  payload: string | null;
}

type DashboardActionTypes =
  | LoadDashboardAction
  | SetDashboardLoadingAction
  | SetDashboardErrorAction;

/******************************* ACTION TYPES ************************************/

const LOAD_DASHBOARD = "dashboard/load";
const SET_DASHBOARD_LOADING = "dashboard/setLoading";
const SET_DASHBOARD_ERROR = "dashboard/setError";

/******************************* ACTION CREATORS *********************************/

export const loadDashboard = (
  dashboard: DashboardData,
): LoadDashboardAction => ({
  type: LOAD_DASHBOARD,
  payload: dashboard,
});

export const setDashboardLoading = (
  loading: boolean,
): SetDashboardLoadingAction => ({
  type: SET_DASHBOARD_LOADING,
  payload: loading,
});

export const setDashboardError = (
  error: string | null,
): SetDashboardErrorAction => ({
  type: SET_DASHBOARD_ERROR,
  payload: error,
});

/******************************* THUNKS *******************************************/

import { csrfFetch } from "./csrf";

export const getDashboard = () => async (dispatch: any) => {
  dispatch(setDashboardLoading(true));
  dispatch(setDashboardError(null));

  try {
    const res = await csrfFetch("/api/dashboard/");

    if (!res.ok) {
      throw new Error("Failed to load dashboard");
    }

    const data: DashboardData = await res.json();

    dispatch(loadDashboard(data));
  } catch (err) {
    console.error("Failed to fetch dashboard:", err);

    dispatch(
      setDashboardError(
        err instanceof Error
          ? err.message
          : "Failed to load dashboard",
      ),
    );
  } finally {
    dispatch(setDashboardLoading(false));
  }
};

/******************************* REDUCER *****************************************/

const initialState: DashboardState = {
  data: null,
  loading: false,
  error: null,
};

export default function dashboardReducer(
  state = initialState,
  action: DashboardActionTypes,
): DashboardState {
  switch (action.type) {
    case LOAD_DASHBOARD:
      return {
        ...state,
        data: action.payload,
        error: null,
      };

    case SET_DASHBOARD_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case SET_DASHBOARD_ERROR:
      return {
        ...state,
        error: action.payload,
      };

    default:
      return state;
  }
}