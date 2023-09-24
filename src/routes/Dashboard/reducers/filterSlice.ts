import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Instrument, Musician, Tag } from "src/app/types";

interface Filter {
  tags: Tag[];
  yearPublishedMin: number;
  yearPublishedMax: number;
  difficultyMin: number;
  difficultyMax: number;
  parts: string[];
  instruments: Instrument[];
  composers: Musician[];
  arrangers: Musician[];
  orchestrators: Musician[];
  transcribers: Musician[];
  lyricists: Musician[];
}

interface FilterExclTag {
  yearPublishedMin: number;
  yearPublishedMax: number;
  difficultyMin: number;
  difficultyMax: number;
  parts: string[];
  instruments: Instrument[];
  composers: Musician[];
  arrangers: Musician[];
  orchestrators: Musician[];
  transcribers: Musician[];
  lyricists: Musician[];
}

const initialState: Filter = {
  tags: [],
  yearPublishedMin: 0,
  yearPublishedMax: Infinity,
  difficultyMin: 0,
  difficultyMax: Infinity,
  parts: [],
  instruments: [],
  composers: [],
  arrangers: [],
  lyricists: [],
  orchestrators: [],
  transcribers: [],
};

export const filterSlice = createSlice({
  name: "selectedPiece",
  initialState,
  reducers: {
    pushTag: (state, action: PayloadAction<Tag>) => {
      if (state.tags.find((tag) => tag.id === action.payload.id)) {
        return;
      }

      const index = state.tags.findIndex((tag) => tag.id > action.payload.id);
      if (index === -1) {
        state.tags.push(action.payload);
      } else {
        state.tags.splice(index, 0, action.payload);
      }
    },
    removeTag: (state, action: PayloadAction<number>) => {
      const index = state.tags.findIndex((tag) => tag.id === action.payload);
      if (index !== -1) {
        state.tags.splice(index, 1);
      }
    },
    setFilterExclTag: (state, action: PayloadAction<FilterExclTag>) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    clearYearPublished: (state) => {
      return {
        ...state,
        yearPublishedMin: 0,
        yearPublishedMax: Infinity,
      };
    },
    clearDifficulty: (state) => {
      return {
        ...state,
        difficultyMin: 0,
        difficultyMax: Infinity,
      };
    },
    clearParts: (state) => {
      return {
        ...state,
        parts: [],
      };
    },
    clearInstruments: (state) => {
      return {
        ...state,
        instruments: [],
      };
    },
    clearRole: (
      state,
      action: PayloadAction<
        | "composers"
        | "arrangers"
        | "orchestrators"
        | "transcribers"
        | "lyricists"
      >
    ) => {
      switch (action.payload) {
        case "composers":
          return {
            ...state,
            composers: [],
          };
        case "arrangers":
          return {
            ...state,
            arrangers: [],
          };
        case "orchestrators":
          return {
            ...state,
            orchestrators: [],
          };
        case "transcribers":
          return {
            ...state,
            transcribers: [],
          };
        case "lyricists":
          return {
            ...state,
            lyricists: [],
          };
        default:
          return state;
      }
    },
    resetFilter: () => {
      return initialState;
    },
  },
});

export const {
  pushTag,
  removeTag,
  setFilterExclTag,
  clearYearPublished,
  clearDifficulty,
  clearParts,
  clearInstruments,
  clearRole,
  resetFilter,
} = filterSlice.actions;

export default filterSlice.reducer;
