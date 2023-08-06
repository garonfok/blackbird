import { PayloadAction, createSlice } from "@reduxjs/toolkit";

const initialState: File[] = [];

export const filesSlice = createSlice({
  name: "files",
  initialState: initialState,
  reducers: {
    pushFiles: (state, action: PayloadAction<{ files: File[] }>) => {
      const { files } = action.payload;

      for (const file of files) {
        if (
          !state.find((f) => f.name === file.name) &&
          file.type === "application/pdf"
        ) {
          state.push(file);
        }
      }
    },
    deleteFile: (state, action: PayloadAction<{ index: number }>) => {
      const { index } = action.payload;
      state.splice(index, 1);
    },
    setFiles: (_, action: PayloadAction<{ files: File[] }>) => {
      const { files } = action.payload;
      return files;
    },
    clearFiles: () => {
      return initialState;
    },
  },
});

export const { pushFiles, deleteFile, setFiles, clearFiles } =
  filesSlice.actions;

export default filesSlice.reducer;
