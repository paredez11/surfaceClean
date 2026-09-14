// src/redux/customers.ts

import { csrfFetch } from "./csrf";
import type { Customer } from "../types/customer";

interface CustomersState {
  all: Record<number, Customer>;
  single: Customer | null;
  loading: boolean;
}

const LOAD_CUSTOMERS = "customers/LOAD_CUSTOMERS";
const LOAD_CUSTOMER = "customers/LOAD_CUSTOMER";
const ADD_CUSTOMER = "customers/ADD_CUSTOMER";
const UPDATE_CUSTOMER = "customers/UPDATE_CUSTOMER";
const DELETE_CUSTOMER = "customers/DELETE_CUSTOMER";
const SET_LOADING = "customers/SET_LOADING";

const loadCustomers = (customers: Customer[]) => ({
  type: LOAD_CUSTOMERS,
  payload: customers,
});

const loadCustomer = (customer: Customer) => ({
  type: LOAD_CUSTOMER,
  payload: customer,
});

const addCustomer = (customer: Customer) => ({
  type: ADD_CUSTOMER,
  payload: customer,
});

const updateCustomer = (customer: Customer) => ({
  type: UPDATE_CUSTOMER,
  payload: customer,
});

const deleteCustomer = (id: number) => ({
  type: DELETE_CUSTOMER,
  payload: id,
});

const setLoading = (loading: boolean) => ({
  type: SET_LOADING,
  payload: loading,
});

export const getCustomers = () => async (dispatch: any) => {
  dispatch(setLoading(true));

  try {
    const res = await csrfFetch("/api/customers/");
    const data = await res.json();

    dispatch(loadCustomers(data));
  } catch (err) {
    console.error("Failed to fetch customers:", err);
  } finally {
    dispatch(setLoading(false));
  }
};

export const getCustomerDetails =
  (id: string | number) => async (dispatch: any) => {
    try {
      const res = await csrfFetch(`/api/customers/${id}`);

      if (!res.ok) {
        throw new Error("Customer not found");
      }

      const data = await res.json();
      dispatch(loadCustomer(data));
    } catch (err) {
      console.error("Failed to fetch customer:", err);
    }
  };

export const createCustomer =
  (customerData: Partial<Customer>) => async (dispatch: any) => {
    const res = await csrfFetch("/api/customers/", {
      method: "POST",
      body: JSON.stringify(customerData),
    });

    if (res.ok) {
      const customer = await res.json();
      dispatch(addCustomer(customer));
      return customer;
    }
  };

export const editCustomer =
  (id: number, updates: Partial<Customer>) => async (dispatch: any) => {
    const res = await csrfFetch(`/api/customers/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });

    if (res.ok) {
      const customer = await res.json();
      dispatch(updateCustomer(customer));
      return customer;
    }
  };

export const removeCustomer = (id: number) => async (dispatch: any) => {
  const res = await csrfFetch(`/api/customers/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const data = await res.json();

    throw new Error(data.detail || "Failed to delete customer");
  }

  dispatch(deleteCustomer(id));

  return true;
};

const initialState: CustomersState = {
  all: {},
  single: null,
  loading: false,
};

export default function customersReducer(
  state = initialState,
  action: any,
): CustomersState {
  switch (action.type) {
    case LOAD_CUSTOMERS: {
      const all: Record<number, Customer> = {};

      action.payload.forEach((customer: Customer) => {
        all[customer.id] = customer;
      });

      return {
        ...state,
        all,
      };
    }

    case LOAD_CUSTOMER:
      return {
        ...state,
        single: action.payload,
      };

    case ADD_CUSTOMER:
    case UPDATE_CUSTOMER:
      return {
        ...state,
        all: {
          ...state.all,
          [action.payload.id]: action.payload,
        },
        single:
          state.single?.id === action.payload.id
            ? action.payload
            : state.single,
      };

    case DELETE_CUSTOMER: {
      const all = { ...state.all };
      delete all[action.payload];

      return {
        ...state,
        all,
        single: state.single?.id === action.payload ? null : state.single,
      };
    }

    case SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    default:
      return state;
  }
}
