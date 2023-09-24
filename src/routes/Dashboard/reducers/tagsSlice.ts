import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Tag } from "src/app/types";

const initialState: Tag[] = [];

export const tagsSlice = createSlice({
  name: "selectedPiece",
  initialState,
  reducers: {
    setTags: (_, action: PayloadAction<{ tags: Tag[] }>) => {
      const { tags } = action.payload;

      return tags;
    },
  },
});

export const { setTags } = tagsSlice.actions;

export default tagsSlice.reducer;
