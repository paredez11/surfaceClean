// front3/src/redux/warranties.ts

import { csrfFetch } from "./csrf";
import type { WarrantyListItem } from "../types";

/******************************* ACTION TYPES *******************************************/

const LOAD_ACTIVE_WARRANTIES =
  "warranties/LOAD_ACTIVE_WARRANTIES";
const SET_WARRANTIES_LOADING =
  "warranties/SET_WARRANTIES_LOADING";
const SET_WARRANTIES_ERROR =
  "warranties/SET_WARRANTIES_ERROR";

/******************************* TYPES *******************************************/

interface WarrantiesState {
  active: WarrantyListItem[];
  loading: boolean;
  error: string | null;
}

/******************************* ACTION CREATORS *******************************************/

const loadActiveWarranties = (
  warranties: WarrantyListItem[],
) => ({
  type: LOAD_ACTIVE_WARRANTIES,
  payload: warranties,
});

const setWarrantiesLoading = (loading: boolean) => ({
  type: SET_WARRANTIES_LOADING,
  payload: loading,
});

const setWarrantiesError = (error: string | null) => ({
  type: SET_WARRANTIES_ERROR,
  payload: error,
});

/******************************* THUNKS *******************************************/

export const getActiveWarranties =
  () => async (dispatch: any) => {
    dispatch(setWarrantiesLoading(true));
    dispatch(setWarrantiesError(null));

    try {
      const res = await csrfFetch(
        "/api/warranties/?status=active",
      );

      if (!res.ok) {
        throw new Error("Failed to load active warranties.");
      }

      const warranties: WarrantyListItem[] =
        await res.json();

      dispatch(loadActiveWarranties(warranties));

      return warranties;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to load active warranties.";

      dispatch(setWarrantiesError(message));

      throw err;
    } finally {
      dispatch(setWarrantiesLoading(false));
    }
  };

/******************************* REDUCER *******************************************/

const initialState: WarrantiesState = {
  active: [],
  loading: false,
  error: null,
};

export default function warrantiesReducer(
  state = initialState,
  action: any,
): WarrantiesState {
  switch (action.type) {
    case LOAD_ACTIVE_WARRANTIES:
      return {
        ...state,
        active: action.payload,
      };

    case SET_WARRANTIES_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case SET_WARRANTIES_ERROR:
      return {
        ...state,
        error: action.payload,
      };

    default:
      return state;
  }
}