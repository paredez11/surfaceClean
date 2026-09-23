// front3/src/redux/sales.ts

import type { Sale, Customer, ServiceRecord } from "../types";
import { csrfFetch } from "./csrf";
import { setLoading } from "./session";

/******************************* ACTION TYPES *******************************************/

const LOAD_SALES = "sales/load";
const LOAD_SINGLE_SALE = "sales/loadSingle";
const ADD_SALE = "sales/add";
const UPDATE_SALE = "sales/update";
const DELETE_SALE = "sales/delete";

/******************************* TYPES *******************************************/

type SalesActionTypes =
  | LoadSalesAction
  | LoadSingleSaleAction
  | AddSaleAction
  | UpdateSaleAction
  | DeleteSaleAction;

interface SalesState {
  all: Record<number, Sale>;
  single: {
    details: Sale | null;
  };
}

interface LoadSalesAction {
  type: typeof LOAD_SALES;
  payload: Sale[];
}

interface LoadSingleSaleAction {
  type: typeof LOAD_SINGLE_SALE;
  payload: Sale;
}

interface AddSaleAction {
  type: typeof ADD_SALE;
  payload: Sale;
}

interface UpdateSaleAction {
  type: typeof UPDATE_SALE;
  payload: Sale;
}

interface DeleteSaleAction {
  type: typeof DELETE_SALE;
  payload: number;
}

/******************************* ACTION CREATORS *******************************************/

export const loadSales = (sales: Sale[]): LoadSalesAction => ({
  type: LOAD_SALES,
  payload: sales,
});

export const loadSingleSale = (sale: Sale): LoadSingleSaleAction => ({
  type: LOAD_SINGLE_SALE,
  payload: sale,
});

export const addSale = (sale: Sale): AddSaleAction => ({
  type: ADD_SALE,
  payload: sale,
});

export const updateSale = (sale: Sale): UpdateSaleAction => ({
  type: UPDATE_SALE,
  payload: sale,
});

export const deleteSale = (id: number): DeleteSaleAction => ({
  type: DELETE_SALE,
  payload: id,
});

/******************************* THUNKS *******************************************/

// Get all sales
export const getSales = () => async (dispatch: any) => {
  try {
    const res = await csrfFetch("/api/sales/");
    const data = await res.json();

    console.log("Fetched sales:", data);

    dispatch(loadSales(data));
  } catch (err) {
    console.error("Failed to fetch sales:", err);
  } finally {
    dispatch(setLoading(false));
  }
};

// Get a single sale
export const getSaleDetails =
  (id: string | number) => async (dispatch: any) => {
    try {
      const res = await csrfFetch(`/api/sales/${id}`);
      if (!res.ok) throw new Error("Sale not found");

      const data = await res.json();

      console.log("Fetched sale details:", data);

      dispatch(loadSingleSale(data));
    } catch (err) {
      console.error("Failed to fetch sale:", err);
    }
  };

// Create sale
export const createSale =
  (saleData: Partial<Sale>) => async (dispatch: any) => {
    const res = await csrfFetch("/api/sales/", {
      method: "POST",
      body: JSON.stringify(saleData),
    });

    if (res.ok) {
      const newSale = await res.json();

      await dispatch(getSales());

      return newSale;
    }
  };

// Update sale
export const editSale =
  (id: number, updates: Partial<Sale>) => async (dispatch: any) => {
    try {
      const res = await csrfFetch(`/api/sales/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });

      const data = await res.json();

      dispatch(updateSale(data));

      return data;
    } catch (err) {
      console.error("Failed to update sale:", err);
    }
  };

// Delete sale
export const removeSale = (id: number) => async (dispatch: any) => {
  const res = await csrfFetch(`/api/sales/${id}`, {
    method: "DELETE",
  });

  if (res.ok) {
    dispatch(deleteSale(id));
  }
};

// Create service record
export const createServiceRecord =
  (serviceData: Partial<ServiceRecord>) => async () => {
    const res = await csrfFetch("/api/service_records/", {
      method: "POST",
      body: JSON.stringify(serviceData),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => null);

      throw new Error(error?.detail || "Failed to create service record.");
    }

    const newServiceRecord: ServiceRecord = await res.json();

    return newServiceRecord;
  };

/******************************* REDUCER *******************************************/

const initialState: SalesState = {
  all: {},
  single: {
    details: null,
  },
};

export default function salesReducer(
  state = initialState,
  action: SalesActionTypes,
): SalesState {
  switch (action.type) {
    case LOAD_SALES: {
      const newAll: Record<number, Sale> = {};

      action.payload.forEach((sale) => {
        newAll[sale.id] = sale;
      });

      return {
        ...state,
        all: newAll,
      };
    }

    case LOAD_SINGLE_SALE:
      return {
        ...state,
        single: {
          ...state.single,
          details: action.payload,
        },
      };

    case ADD_SALE:
      return {
        ...state,
        all: {
          ...state.all,
          [action.payload.id]: action.payload,
        },
      };

    case UPDATE_SALE:
      return {
        ...state,
        all: {
          ...state.all,
          [action.payload.id]: {
            ...state.all[action.payload.id],
            ...action.payload,
          },
        },
      };

    case DELETE_SALE: {
      const newAll = { ...state.all };

      delete newAll[action.payload];

      return {
        ...state,
        all: newAll,
      };
    }

    default:
      return state;
  }
}
