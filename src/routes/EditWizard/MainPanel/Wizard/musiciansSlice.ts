import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Musician } from "../../../../app/types";

const initialState: Musician[] = [];

export const musiciansSlice = createSlice({
  name: "files",
  initialState: initialState,
  reducers: {
    setMusicians: (_, action: PayloadAction<{ musicians: Musician[] }>) => {
      const { musicians } = action.payload;

      return musicians;
    },
  },
});

export const { setMusicians } = musiciansSlice.actions;

export default musiciansSlice.reducer;
