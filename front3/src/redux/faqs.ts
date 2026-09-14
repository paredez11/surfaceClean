// redux/faqs.ts

import { csrfFetch } from './csrf';
import { setLoading } from './session';
import type { FAQ } from '../types';

/******************************* TYPES *******************************************/

interface FAQState {
  all: Record<number, FAQ>;
}

interface LoadFaqsAction {
  type: typeof LOAD_FAQS;
  payload: FAQ[];
}

interface AddFaqAction {
  type: typeof ADD_FAQ;
  payload: FAQ;
}

interface UpdateFaqAction {
  type: typeof UPDATE_FAQ;
  payload: FAQ;
}

interface DeleteFaqAction {
  type: typeof DELETE_FAQ;
  payload: number;
}

type FAQActionTypes =
  | LoadFaqsAction
  | AddFaqAction
  | UpdateFaqAction
  | DeleteFaqAction;

/******************************* ACTION TYPES *******************************************/

const LOAD_FAQS = 'faqs/load';
const ADD_FAQ = 'faqs/add';
const UPDATE_FAQ = 'faqs/update';
const DELETE_FAQ = 'faqs/delete';

/******************************* ACTION CREATORS *******************************************/

export const loadFaqs = (faqs: FAQ[]): LoadFaqsAction => ({
  type: LOAD_FAQS,
  payload: faqs,
});

export const addFaq = (faq: FAQ): AddFaqAction => ({
  type: ADD_FAQ,
  payload: faq,
});

export const updateFaq = (faq: FAQ): UpdateFaqAction => ({
  type: UPDATE_FAQ,
  payload: faq,
});

export const deleteFaq = (id: number): DeleteFaqAction => ({
  type: DELETE_FAQ,
  payload: id,
});

/******************************* THUNKS *******************************************/

// Get all FAQs (admin)
export const getAllFaqs = () => async (dispatch: any) => {
  try {
    const res = await csrfFetch('/api/faqs/');
    const data = await res.json();
    dispatch(loadFaqs(data));
  } catch (e) {
    console.error('Error loading all FAQs', e);
  } finally {
    dispatch(setLoading(false));
  }
};

// Get live/public FAQs
export const getLiveFaqs = () => async (dispatch: any) => {
  try {
    const res = await fetch('/api/faqs/live');
    const data = await res.json();
    dispatch(loadFaqs(data));
  } catch (e) {
    console.error('Error loading live FAQs', e);
  }
};

// Create FAQ
export const createFaq = (faqData: Partial<FAQ>) => async (dispatch: any) => {
  const res = await csrfFetch('/api/faqs/', {
    method: 'POST',
    body: JSON.stringify(faqData),
  });
  const data = await res.json();
  dispatch(addFaq(data));
  return data;
};

// Update FAQ
export const editFaq = (id: number, updates: Partial<FAQ>) => async (dispatch: any) => {
  const res = await csrfFetch(`/api/faqs/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  dispatch(updateFaq(data));
  return data;
};

// Delete FAQ
export const removeFaq = (id: number) => async (dispatch: any) => {
  const res = await csrfFetch(`/api/faqs/${id}`, {
    method: 'DELETE',
  });
  if (res.ok) {
    dispatch(deleteFaq(id));
  }
};

/******************************* REDUCER *******************************************/

const initialState: FAQState = {
  all: {},
};

export default function faqsReducer(
  state = initialState,
  action: FAQActionTypes
): FAQState {
  switch (action.type) {
    case LOAD_FAQS: {
      const newAll: Record<number, FAQ> = {};
      action.payload.forEach((faq) => {
        newAll[faq.id] = faq;
      });
      return { ...state, all: newAll };
    }
    case ADD_FAQ:
    case UPDATE_FAQ:
      return {
        ...state,
        all: { ...state.all, [action.payload.id]: action.payload },
      };
    case DELETE_FAQ: {
      const newAll = { ...state.all };
      delete newAll[action.payload];
      return { ...state, all: newAll };
    }
    default:
      return state;
  }
}