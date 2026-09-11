// front3/src/redux/machines.ts

/******************************* TYPES *******************************************/

interface Image {
  id: number;
  url: string;
  description?: string;
  machine_id: number;
}

export interface EquipmentProfile {
  id: number;
  manufacturer: string;
  model: string;
  category: string;
  description?: string | null;
  specifications?: string | null;
  best_for?: string | null;
  not_for?: string | null;
  key_benefits?: string | null;
  common_uses?: string | null;
  faq?: string | null;
  comparison_notes?: string | null;
  manufacturer_url?: string | null;
  source_notes?: string | null;
}

interface Machine {
  id: number;
  name: string;
  price: number;
  condition: string;
  description?: string;
  hours_used?: number;

  equipment_profile_id?: number | null;
  equipment_profile?: EquipmentProfile | null;

  seo_title?: string;
  seo_description?: string;
  slug?: string;

  status: "listed" | "sold" | "delivered";
  sale_price?: number | null;

  images?: Image[];
}

interface MachinesState {
  all: Record<number, Machine>;
  single: {
    details: Machine | null;
  };
}

interface LoadMachinesAction {
  type: typeof LOAD_MACHINES;
  payload: Machine[];
}

interface LoadSingleMachineAction {
  type: typeof LOAD_SINGLE_MACHINE;
  payload: Machine;
}

interface AddMachineAction {
  type: typeof ADD_MACHINE;
  payload: Machine;
}

interface UpdateMachineAction {
  type: typeof UPDATE_MACHINE;
  payload: Machine;
}

interface DeleteMachineAction {
  type: typeof DELETE_MACHINE;
  payload: number;
}

type MachinesActionTypes =
  | LoadMachinesAction
  | LoadSingleMachineAction
  | AddMachineAction
  | UpdateMachineAction
  | DeleteMachineAction;

/******************************* ACTION TYPES *******************************************/

const LOAD_MACHINES = "machines/load";
const LOAD_SINGLE_MACHINE = "machines/loadSingle";
const ADD_MACHINE = "machines/add";
const UPDATE_MACHINE = "machines/update";
const DELETE_MACHINE = "machines/delete";

/******************************* ACTION CREATORS *******************************************/

export const loadMachines = (machines: Machine[]): LoadMachinesAction => ({
  type: LOAD_MACHINES,
  payload: machines,
});

export const loadSingleMachine = (
  machine: Machine,
): LoadSingleMachineAction => ({
  type: LOAD_SINGLE_MACHINE,
  payload: machine,
});

export const addMachine = (machine: Machine): AddMachineAction => ({
  type: ADD_MACHINE,
  payload: machine,
});

export const updateMachine = (machine: Machine): UpdateMachineAction => ({
  type: UPDATE_MACHINE,
  payload: machine,
});

export const deleteMachine = (id: number): DeleteMachineAction => ({
  type: DELETE_MACHINE,
  payload: id,
});

/******************************* THUNKS *******************************************/

import { csrfFetch } from "./csrf";
import { setLoading } from "./session";

// Get all machines
export const getMachines = () => async (dispatch: any) => {
  try {
    const res = await csrfFetch("/api/machines/");
    const data = await res.json();

    console.log("Fetched machines:", data);

    dispatch(loadMachines(data));
  } catch (err) {
    console.error("Failed to fetch machines:", err);
  } finally {
    dispatch(setLoading(false));
  }
};

// Get a single machine
export const getMachineDetails =
  (id: string | number) => async (dispatch: any) => {
    try {
      const res = await csrfFetch(`/api/machines/${id}`);
      if (!res.ok) throw new Error("Machine not found");

      const data = await res.json();
      console.log("Fetched machine details:", data);

      dispatch(loadSingleMachine(data));
    } catch (err) {
      console.error("Failed to fetch machine:", err);
    }
  };

// Add machine
export const createMachine =
  (machineData: Partial<Machine>) => async (dispatch: any) => {
    const res = await csrfFetch("/api/machines/", {
      method: "POST",
      body: JSON.stringify(machineData),
    });

    if (res.ok) {
      const newMachine = await res.json();
      dispatch(addMachine(newMachine));
      return newMachine;
    }
  };

// Update machine
export const editMachine =
  (id: number, updates: Partial<Machine>) => async (dispatch: any) => {
    try {
      console.log("Editing machine with id:", id);
      const res = await csrfFetch(`/api/machines/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });

      // If the backend returns the updated machine, use it
      const data = await res.json().catch(() => null);
      console.log("PATCH /api/machines/:id →", data);

      if (data && data.id) {
        dispatch(updateMachine(data));
      } else {
        // If server doesn't return the record, keep UI snappy but then sync
        dispatch(updateMachine({ id, ...(updates as any) }));
      }

      // 🔁 Always sync from server to confirm it actually persisted
      await dispatch(getMachines());
    } catch (err) {
      console.error("editMachine failed:", err);
    }
  };

// Delete machine (from DB and Cloudinary)
export const removeMachine = (id: number) => async (dispatch: any) => {
  const res = await csrfFetch(`/api/machines/${id}`, {
    method: "DELETE",
  });

  if (res.ok) {
    dispatch(deleteMachine(id));
  }
};

/******************************* REDUCER *******************************************/

const initialState: MachinesState = {
  all: {},
  single: {
    details: null,
  },
};

export default function machinesReducer(
  state = initialState,
  action: MachinesActionTypes,
): MachinesState {
  switch (action.type) {
    case LOAD_MACHINES: {
      const newAll: Record<number, Machine> = {};
      action.payload.forEach((m) => (newAll[m.id] = m));
      return { ...state, all: newAll };
    }
    case LOAD_SINGLE_MACHINE:
      return {
        ...state,
        single: {
          ...state.single,
          details: action.payload,
        },
      };
    case ADD_MACHINE:
    case UPDATE_MACHINE:
      return {
        ...state,
        all: { ...state.all, [action.payload.id]: action.payload },
      };
    case DELETE_MACHINE: {
      const newAll = { ...state.all };
      delete newAll[action.payload];
      return { ...state, all: newAll };
    }
    default:
      return state;
  }
}
