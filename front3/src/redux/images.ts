// front3/src/redux/images.ts

import type { Image } from "../types";
import { csrfFetch } from "./csrf";
import { setLoading } from "./session";

/******************************* ACTION TYPES *******************************************/

const LOAD_IMAGES = "images/loadImages";
const ADD_IMAGE = "images/addImage";
const UPDATE_IMAGE = "images/updateImage";
const DELETE_IMAGE = "images/deleteImage";

/******************************* TYPES *******************************************/

export interface ImagesState {
  images: Record<number, Image>;
}

interface LoadImagesAction {
  type: typeof LOAD_IMAGES;
  payload: Image[];
}

interface AddImageAction {
  type: typeof ADD_IMAGE;
  payload: Image;
}

interface UpdateImageAction {
  type: typeof UPDATE_IMAGE;
  payload: Image;
}

interface DeleteImageAction {
  type: typeof DELETE_IMAGE;
  payload: number;
}

export type ImageActionTypes =
  | LoadImagesAction
  | AddImageAction
  | UpdateImageAction
  | DeleteImageAction;

/******************************* ACTION CREATORS *******************************************/

export const loadImages = (images: Image[]): LoadImagesAction => ({
  type: LOAD_IMAGES,
  payload: images,
});

export const addImage = (image: Image): AddImageAction => ({
  type: ADD_IMAGE,
  payload: image,
});

export const updateImage = (image: Image): UpdateImageAction => ({
  type: UPDATE_IMAGE,
  payload: image,
});

export const deleteImage = (imageId: number): DeleteImageAction => ({
  type: DELETE_IMAGE,
  payload: imageId,
});

/******************************* THUNKS *******************************************/

// Get all images
export const getAllImages = () => async (dispatch: any) => {
  try {
    const res = await csrfFetch("/api/images/");
    const data = await res.json();

    dispatch(loadImages(data.images));
  } catch (err) {
    console.error("Failed to fetch images:", err);
  } finally {
    dispatch(setLoading(false));
  }
};

// Create image
export const createImage =
  (form: FormData) => async (dispatch: any) => {
    const res = await csrfFetch("/api/images/", {
      method: "POST",
      body: form,
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error("Image upload failed");
    }

    const newImage = await res.json();

    dispatch(addImage(newImage));

    return newImage;
  };

// Update image
export const editImage =
  (imageId: number, updates: Partial<Image>) =>
  async (dispatch: any) => {
    try {
      const res = await csrfFetch(`/api/images/${imageId}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });

      const data = await res.json();

      dispatch(updateImage(data));

      return data;
    } catch (err) {
      console.error("Failed to update image:", err);
    }
  };

// Delete image
export const removeImage =
  (imageId: number) => async (dispatch: any) => {
    try {
      const res = await csrfFetch(`/api/images/${imageId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        dispatch(deleteImage(imageId));
      }
    } catch (err) {
      console.error("Failed to delete image:", err);
    }
  };

/******************************* REDUCER *******************************************/

const initialState: ImagesState = {
  images: {},
};

export default function imagesReducer(
  state = initialState,
  action: ImageActionTypes,
): ImagesState {
  switch (action.type) {
    case LOAD_IMAGES: {
      const newImages: Record<number, Image> = {};

      action.payload.forEach((image) => {
        newImages[image.id] = image;
      });

      return {
        ...state,
        images: newImages,
      };
    }

    case ADD_IMAGE:
    case UPDATE_IMAGE:
      return {
        ...state,
        images: {
          ...state.images,
          [action.payload.id]: action.payload,
        },
      };

    case DELETE_IMAGE: {
      const newImages = { ...state.images };

      delete newImages[action.payload];

      return {
        ...state,
        images: newImages,
      };
    }

    default:
      return state;
  }
}