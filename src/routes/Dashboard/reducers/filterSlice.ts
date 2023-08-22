import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Instrument, Musician, Tag } from "../../../app/types";

interface Filter {
  tags: Tag[];
  yearPublished: number | null;
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
  yearPublished: null,
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
    setYearPublished: (state, action: PayloadAction<number | null>) => {
      state.yearPublished = action.payload;
    },
    setParts: (state, action: PayloadAction<string[]>) => {
      state.parts = action.payload;
    },
    setInstruments: (state, action: PayloadAction<Instrument[]>) => {
      state.instruments = action.payload;
    },
    setComposers: (state, action: PayloadAction<Musician[]>) => {
      state.composers = action.payload;
    },
    setArrangers: (state, action: PayloadAction<Musician[]>) => {
      state.arrangers = action.payload;
    },
    setOrchestrators: (state, action: PayloadAction<Musician[]>) => {
      state.orchestrators = action.payload;
    },
    setTranscribers: (state, action: PayloadAction<Musician[]>) => {
      state.transcribers = action.payload;
    },
    setLyricists: (state, action: PayloadAction<Musician[]>) => {
      state.lyricists = action.payload;
    },
    resetFilter: () => {
      return initialState;
    },
  },
});

export const {
  pushTag,
  removeTag,
  setYearPublished,
  setParts,
  setInstruments,
  setComposers,
  setArrangers,
  setOrchestrators,
  setTranscribers,
  setLyricists,
  resetFilter,
} = filterSlice.actions;

export default filterSlice.reducer;
