import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Setlist } from "@/app/types";

const initialState: { setlist: Setlist | null } = {
  setlist: null,
};

export const previewSlice = createSlice({
  name: "selectedPiece",
  initialState,
  reducers: {
    setSetlist: (_, action: PayloadAction<{ setlist: Setlist }>) => {
      const { setlist } = action.payload;

      return { setlist };
    },
    clearSetlist: () => {
      return { setlist: null };
    },
  },
});

export const { setSetlist, clearSetlist } = previewSlice.actions;

export default previewSlice.reducer;
