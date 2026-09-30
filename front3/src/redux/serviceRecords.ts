import { csrfFetch } from "./csrf";
import type { ServiceRecordListItem } from "../types";

// ACTION TYPES

const LOAD_SERVICE_RECORDS = "serviceRecords/LOAD_SERVICE_RECORDS";
const SET_SERVICE_RECORDS_LOADING = "serviceRecords/SET_SERVICE_RECORDS_LOADING";
const SET_SERVICE_RECORDS_ERROR = "serviceRecords/SET_SERVICE_RECORDS_ERROR";

// TYPES

interface ServiceRecordsState {
  records: ServiceRecordListItem[];
  loading: boolean;
  error: string | null;
}

// ACTION CREATORS

const loadServiceRecords = (records: ServiceRecordListItem[]) => ({
  type: LOAD_SERVICE_RECORDS,
  payload: records,
});

const setServiceRecordsLoading = (loading: boolean) => ({
  type: SET_SERVICE_RECORDS_LOADING,
  payload: loading,
});

const setServiceRecordsError = (error: string | null) => ({
  type: SET_SERVICE_RECORDS_ERROR,
  payload: error,
});

// THUNKS

export const getServiceRecords = () => async (dispatch: any) => {
  dispatch(setServiceRecordsLoading(true));
  dispatch(setServiceRecordsError(null));

  try {
    const res = await csrfFetch("/api/service_records/");

    if (!res.ok) {
      throw new Error("Failed to load service records.");
    }

    const records: ServiceRecordListItem[] = await res.json();

    dispatch(loadServiceRecords(records));

    return records;
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Failed to load service records.";

    dispatch(setServiceRecordsError(message));
    throw err;
  } finally {
    dispatch(setServiceRecordsLoading(false));
  }
};

// REDUCER

const initialState: ServiceRecordsState = {
  records: [],
  loading: false,
  error: null,
};

export default function serviceRecordsReducer(
  state = initialState,
  action: any,
): ServiceRecordsState {
  switch (action.type) {
    case LOAD_SERVICE_RECORDS:
      return {
        ...state,
        records: action.payload,
      };

    case SET_SERVICE_RECORDS_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case SET_SERVICE_RECORDS_ERROR:
      return {
        ...state,
        error: action.payload,
      };

    default:
      return state;
  }
}