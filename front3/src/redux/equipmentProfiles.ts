// front3/src/redux/equipmentProfiles.ts

/******************************* TYPES *******************************************/
import type { EquipmentProfile, EquipmentProfileCreate, EquipmentProfileUpdate } from "../types";

interface EquipmentProfilesState {
  all: Record<number, EquipmentProfile>;
}

interface LoadEquipmentProfilesAction {
  type: typeof LOAD_EQUIPMENT_PROFILES;
  payload: EquipmentProfile[];
}

interface AddEquipmentProfileAction {
  type: typeof ADD_EQUIPMENT_PROFILE;
  payload: EquipmentProfile;
}

interface UpdateEquipmentProfileAction {
  type: typeof UPDATE_EQUIPMENT_PROFILE;
  payload: EquipmentProfile;
}

interface DeleteEquipmentProfileAction {
  type: typeof DELETE_EQUIPMENT_PROFILE;
  payload: number;
}

type EquipmentProfilesActionTypes =
  | LoadEquipmentProfilesAction
  | AddEquipmentProfileAction
  | UpdateEquipmentProfileAction
  | DeleteEquipmentProfileAction;

/******************************* ACTION TYPES *******************************************/

const LOAD_EQUIPMENT_PROFILES = "equipmentProfiles/load";
const ADD_EQUIPMENT_PROFILE = "equipmentProfiles/add";
const UPDATE_EQUIPMENT_PROFILE = "equipmentProfiles/update";
const DELETE_EQUIPMENT_PROFILE = "equipmentProfiles/delete";

/******************************* ACTION CREATORS *******************************************/

export const loadEquipmentProfiles = (
  profiles: EquipmentProfile[],
): LoadEquipmentProfilesAction => ({
  type: LOAD_EQUIPMENT_PROFILES,
  payload: profiles,
});

export const addEquipmentProfile = (
  profile: EquipmentProfile,
): AddEquipmentProfileAction => ({
  type: ADD_EQUIPMENT_PROFILE,
  payload: profile,
});

export const updateEquipmentProfile = (
  profile: EquipmentProfile,
): UpdateEquipmentProfileAction => ({
  type: UPDATE_EQUIPMENT_PROFILE,
  payload: profile,
});

export const deleteEquipmentProfile = (
  id: number,
): DeleteEquipmentProfileAction => ({
  type: DELETE_EQUIPMENT_PROFILE,
  payload: id,
});

/******************************* THUNKS *******************************************/

import { csrfFetch } from "./csrf";

// Get all equipment profiles
export const getEquipmentProfiles = () => async (dispatch: any) => {
  try {
    const res = await csrfFetch("/api/equipment_profiles/");
    const data = await res.json();

    console.log("Fetched equipment profiles:", data);

    dispatch(loadEquipmentProfiles(data));

    return data;
  } catch (err) {
    console.error("Failed to fetch equipment profiles:", err);
  }
};

// Add equipment profile
export const createEquipmentProfile =
  (profileData: EquipmentProfileCreate) => async (dispatch: any) => {
    const res = await csrfFetch("/api/equipment_profiles/", {
      method: "POST",
      body: JSON.stringify(profileData),
    });

    if (res.ok) {
      const newProfile = await res.json();

      dispatch(addEquipmentProfile(newProfile));

      return newProfile;
    }
  };

// Update equipment profile
export const editEquipmentProfile =
  (
    id: number,
    updates: EquipmentProfileUpdate,
  ) =>
  async (dispatch: any) => {
    try {
      console.log("Editing equipment profile with id:", id);

      const res = await csrfFetch(
        `/api/equipment_profiles/${id}`,
        {
          method: "PATCH",
          body: JSON.stringify(updates),
        },
      );

      const data = await res.json().catch(() => null);

      console.log(
        "PATCH /api/equipment_profiles/:id →",
        data,
      );

      if (data && data.id) {
        dispatch(updateEquipmentProfile(data));
      }

      await dispatch(getEquipmentProfiles());
    } catch (err) {
      console.error("editEquipmentProfile failed:", err);
    }
  };

// Delete equipment profile
export const removeEquipmentProfile =
  (id: number) => async (dispatch: any) => {
    const res = await csrfFetch(
      `/api/equipment_profiles/${id}`,
      {
        method: "DELETE",
      },
    );

    if (res.ok) {
      dispatch(deleteEquipmentProfile(id));
    }
  };

/******************************* REDUCER *******************************************/

const initialState: EquipmentProfilesState = {
  all: {},
};

export default function equipmentProfilesReducer(
  state = initialState,
  action: EquipmentProfilesActionTypes,
): EquipmentProfilesState {
  switch (action.type) {
    case LOAD_EQUIPMENT_PROFILES: {
      const newAll: Record<number, EquipmentProfile> = {};

      action.payload.forEach(
        (profile) => (newAll[profile.id] = profile),
      );

      return {
        ...state,
        all: newAll,
      };
    }

    case ADD_EQUIPMENT_PROFILE:
    case UPDATE_EQUIPMENT_PROFILE:
      return {
        ...state,
        all: {
          ...state.all,
          [action.payload.id]: action.payload,
        },
      };

    case DELETE_EQUIPMENT_PROFILE: {
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