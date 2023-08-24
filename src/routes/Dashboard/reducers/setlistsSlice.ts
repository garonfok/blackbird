import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Setlist } from "../../../app/types";

const initialState: Setlist[] = [];

export const previewSlice = createSlice({
  name: "selectedPiece",
  initialState,
  reducers: {
    setSetlists: (_, action: PayloadAction<{ setlists: Setlist[] }>) => {
      const { setlists } = action.payload;

      return setlists;
    },
  },
});

export const { setSetlists } = previewSlice.actions;

export default previewSlice.reducer;
