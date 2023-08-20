import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export const querySlice = createSlice({
  name: "files",
  initialState: "",
  reducers: {
    setQuery: (_, action: PayloadAction<{ query: string }>) => {
      const { query } = action.payload;

      return query;
    },
  },
});

export const { setQuery } = querySlice.actions;

export default querySlice.reducer;
