import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Piece } from "../../../app/types";

const initialState: { piece: Piece | null } = {
  piece: null,
};

export const previewSlice = createSlice({
  name: "selectedPiece",
  initialState,
  reducers: {
    setPiece: (_, action: PayloadAction<{ piece: Piece }>) => {
      const { piece } = action.payload;

      return { piece };
    },
    clearPiece: () => {
      return { piece: null };
    },
  },
});

export const { setPiece, clearPiece } = previewSlice.actions;

export default previewSlice.reducer;
