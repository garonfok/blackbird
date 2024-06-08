import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Instrument, Musician, Tag } from "@/app/types";

interface Filter {
  tags: Tag[];
  yearPublishedMin?: number;
  yearPublishedMax?: number;
  difficultyMin?: number;
  difficultyMax?: number;
  instruments: Instrument[];
  composers: Musician[];
  arrangers: Musician[];
  orchestrators: Musician[];
  transcribers: Musician[];
  lyricists: Musician[];
}

const initialState: Filter = {
  tags: [],
  yearPublishedMin: undefined,
  yearPublishedMax: undefined,
  difficultyMin: undefined,
  difficultyMax: undefined,
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
      const { payload } = action;
      const index = state.tags.findIndex((tag) => tag.id === payload);
      if (index !== -1) {
        state.tags.splice(index, 1);
      }
    },
    clearTags: (state) => {
      return {
        ...state,
        tags: [],
      };
    },
    clearYearPublishedMin: (state) => {
      return {
        ...state,
        yearPublishedMin: undefined,
      };
    },
    clearYearPublishedMax: (state) => {
      return {
        ...state,
        yearPublishedMax: undefined,
      };
    },
    setYearPublishedMin: (state, action: PayloadAction<number>) => {
      return {
        ...state,
        yearPublishedMin: action.payload,
      };
    },
    setYearPublishedMax: (state, action: PayloadAction<number>) => {
      return {
        ...state,
        yearPublishedMax: action.payload,
      };
    },
    clearDifficultyMin: (state) => {
      return {
        ...state,
        difficultyMin: undefined,
      };
    },
    clearDifficultyMax: (state) => {
      return {
        ...state,
        difficultyMax: undefined,
      };
    },
    setDifficultyMin: (state, action: PayloadAction<number>) => {
      return {
        ...state,
        difficultyMin: action.payload,
      };
    },
    setDifficultyMax: (state, action: PayloadAction<number>) => {
      return {
        ...state,
        difficultyMax: action.payload,
      };
    },
    clearParts: (state) => {
      return {
        ...state,
        parts: [],
      };
    },
    pushInstrument: (state, action: PayloadAction<Instrument>) => {
      const { payload } = action;
      if (
        state.instruments.find((instrument) => instrument.id === payload.id)
      ) {
        return;
      }

      const index = state.instruments.findIndex(
        (instrument) => instrument.id > payload.id,
      );
      if (index === -1) {
        state.instruments.push(payload);
      } else {
        state.instruments.splice(index, 0, payload);
      }
    },
    removeInstrument: (state, action: PayloadAction<number>) => {
      const { payload } = action;
      const index = state.instruments.findIndex(
        (instrument) => instrument.id === payload,
      );
      if (index !== -1) {
        state.instruments.splice(index, 1);
      }
    },
    clearInstruments: (state) => {
      return {
        ...state,
        instruments: [],
      };
    },
    pushRole: (
      state,
      action: PayloadAction<{
        musician: Musician;
        role:
          | "composers"
          | "arrangers"
          | "orchestrators"
          | "transcribers"
          | "lyricists";
      }>,
    ) => {
      const { musician, role } = action.payload;
      if (state[role].find((m) => m.id === musician.id)) {
        return;
      }

      const index = state[role].findIndex((m) => m.id > musician.id);
      if (index === -1) {
        state[role].push(musician);
      } else {
        state[role].splice(index, 0, musician);
      }
    },
    removeRole: (
      state,
      action: PayloadAction<{
        musician: Musician;
        role:
          | "composers"
          | "arrangers"
          | "orchestrators"
          | "transcribers"
          | "lyricists";
      }>,
    ) => {
      const { musician, role } = action.payload;
      const index = state[role].findIndex((m) => m.id === musician.id);
      if (index !== -1) {
        state[role].splice(index, 1);
      }
    },
    clearRole: (
      state,
      action: PayloadAction<
        | "composers"
        | "arrangers"
        | "orchestrators"
        | "transcribers"
        | "lyricists"
      >,
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
  clearTags,
  clearYearPublishedMin,
  clearYearPublishedMax,
  setYearPublishedMin,
  setYearPublishedMax,
  clearDifficultyMin,
  clearDifficultyMax,
  setDifficultyMin,
  setDifficultyMax,
  clearParts,
  pushInstrument,
  removeInstrument,
  clearInstruments,
  pushRole,
  removeRole,
  clearRole,
  resetFilter,
} = filterSlice.actions;

export default filterSlice.reducer;
