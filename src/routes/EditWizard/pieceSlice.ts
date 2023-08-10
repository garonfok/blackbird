import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Musician, Tag } from "../../app/types";
import { invoke } from "@tauri-apps/api";

interface EditPiece {
  title: string;
  yearPublished?: number;
  difficulty?: number;
  notes: string;
  tags: Tag[];
  composers: Musician[];
}

const initialState: EditPiece = {
  title: "",
  yearPublished: undefined,
  difficulty: undefined,
  notes: "",
  tags: [],
  composers: [],
};

const getPiece = createAsyncThunk("editPiece/getPiece", async (id: number) => {
  const piece = await invoke("pieces_get_by_id", { id });
  return piece;
});

export const pieceSlice = createSlice({
  name: "piece",
  initialState: initialState,
  reducers: {
    clearPiece: () => {
      return initialState;
    },
    setTitle: (state, action: PayloadAction<string>) => {
      state.title = action.payload;
    },
    setYearPublished: (state, action: PayloadAction<number | undefined>) => {
      state.yearPublished = action.payload;
    },
    setDifficulty: (state, action: PayloadAction<number | undefined>) => {
      state.difficulty = action.payload;
    },
    setNotes: (state, action: PayloadAction<string>) => {
      state.notes = action.payload;
    },
    setTags: (state, action: PayloadAction<Tag[]>) => {
      state.tags = action.payload;
    },
    setComposers: (state, action: PayloadAction<Musician[]>) => {
      state.composers = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getPiece.fulfilled, (_, action: PayloadAction<any>) => {
      const piece = action.payload;

      const result = {
        title: piece.title,
        yearPublished: piece.year_published,
        difficulty: piece.difficulty,
        notes: piece.notes,
        tags: piece.tags,
        composers: piece.composers,
      };
      return result;
    });
  },
});

export const {
  clearPiece,
  setTitle,
  setYearPublished,
  setDifficulty,
  setNotes,
  setTags,
  setComposers,
} = pieceSlice.actions;

export { getPiece };

export default pieceSlice.reducer;
