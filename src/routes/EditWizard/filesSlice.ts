import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { ByteFile } from "src/app/types";

const initialState: ByteFile[] = [];

export const filesSlice = createSlice({
  name: "files",
  initialState: initialState,
  reducers: {
    pushFiles: (state, action: PayloadAction<{ files: ByteFile[] }>) => {
      const { files } = action.payload;

      const names = state.map((file) => file.name);
      const dedupedFiles = files.filter((file) => !names.includes(file.name));
      state.push(...dedupedFiles);
    },
    deleteFile: (state, action: PayloadAction<number>) => {
      state.splice(action.payload, 1);
    },
    setFiles: (_, action: PayloadAction<{ files: ByteFile[] }>) => {
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
