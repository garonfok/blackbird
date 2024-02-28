import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Piece } from "@/app/types";

const initialState: Piece[] = [];

export const PiecesSlice = createSlice({
  name: "selectedPiece",
  initialState,
  reducers: {
    setPieces: (_, action: PayloadAction<{ pieces: Piece[] }>) => {
      const { pieces } = action.payload;

      return pieces;
    },
  },
});

export const { setPieces } = PiecesSlice.actions;

export default PiecesSlice.reducer;
