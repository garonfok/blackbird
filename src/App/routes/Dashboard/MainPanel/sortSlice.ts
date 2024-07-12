import { createSlice } from "@reduxjs/toolkit";

type sortId = "title" | "composers" | "yearPublished" | "updatedAt";

interface SortState {
  id: sortId;
  descending: boolean;
}

const initialState: SortState = {
  id: "updatedAt",
  descending: true,
};

export const sortSlice = createSlice({
  name: "sort",
  initialState,
  reducers: {
    clickMain: (state) => {
      if (state.id === "title") {
        if (!state.descending) {
          return { id: "title", descending: true };
        } else {
          return { id: "composers", descending: false };
        }
      }
      if (state.id === "composers") {
        if (!state.descending) {
          return { id: "composers", descending: true };
        }
        return initialState;
      }
      return { id: "title", descending: false };
    },
    clickTitle: (state) => {
      if (state.id === "title") {
        if (!state.descending) {
          return { id: "title", descending: true };
        } else {
          return initialState;
        }
      }
      return { id: "title", descending: false };
    },
    clickComposers: (state) => {
      if (state.id === "composers") {
        if (!state.descending) {
          return { id: "composers", descending: true };
        } else {
          return initialState;
        }
      }
      return { id: "composers", descending: false };
    },
    clickYearPublished: (state) => {
      if (state.id === "yearPublished") {
        if (state.descending) {
          return { id: "yearPublished", descending: false };
        } else {
          return initialState;
        }
      }
      return { id: "yearPublished", descending: true };
    },
    clickUpdatedAt: (state) => {
      if (state.id === "updatedAt") {
        return { id: "updatedAt", descending: !state.descending };
      }
      return initialState;
    },
    resetSorting: () => {
      return initialState;
    },
  },
});

export const {
  clickMain,
  clickTitle,
  clickComposers,
  clickYearPublished,
  clickUpdatedAt,
  resetSorting,
} = sortSlice.actions;

export default sortSlice.reducer;
