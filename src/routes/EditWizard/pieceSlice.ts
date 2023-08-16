import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Musician, EditPart, Tag, Instrument } from "../../app/types";
import { invoke } from "@tauri-apps/api";

interface EditPiece {
  title: string;
  yearPublished?: number;
  difficulty?: number;
  notes: string;
  tags: Tag[];
  composers: Musician[];
  arrangers: Musician[];
  transcribers: Musician[];
  orchestrators: Musician[];
  lyricists: Musician[];
  parts: EditPart[];
}

const initialState: EditPiece = {
  title: "",
  yearPublished: undefined,
  difficulty: undefined,
  notes: "",
  tags: [],
  composers: [],
  arrangers: [],
  transcribers: [],
  orchestrators: [],
  lyricists: [],
  parts: [],
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
    setArrangers: (state, action: PayloadAction<Musician[]>) => {
      state.arrangers = action.payload;
    },
    setTranscribers: (state, action: PayloadAction<Musician[]>) => {
      state.transcribers = action.payload;
    },
    setOrchestrators: (state, action: PayloadAction<Musician[]>) => {
      state.orchestrators = action.payload;
    },
    setLyricists: (state, action: PayloadAction<Musician[]>) => {
      state.lyricists = action.payload;
    },
    setParts: (state, action: PayloadAction<EditPart[]>) => {
      state.parts = action.payload;
    },
    pushPart: (state, action: PayloadAction<EditPart>) => {
      state.parts.push(action.payload);
    },
    removePart: (state, action: PayloadAction<number>) => {
      return {
        ...state,
        parts: state.parts.filter((_, index) => index !== action.payload),
      };
    },
    updatePartName: (
      state,
      action: PayloadAction<{ index: number; name: string }>
    ) => {
      return {
        ...state,
        parts: state.parts.map((part, index) => {
          if (index === action.payload.index) {
            return { ...part, name: action.payload.name };
          }
          return part;
        }),
      };
    },
    setPartRenaming: (
      state,
      action: PayloadAction<{ partIndex: number; renaming: boolean }>
    ) => {
      const { partIndex, renaming } = action.payload;
      return {
        ...state,
        parts: state.parts.map((part, index) => {
          if (index === partIndex) {
            return { ...part, renaming: renaming };
          }
          return part;
        }),
      };
    },
    setPartShow: (
      state,
      action: PayloadAction<{ index: number; show: boolean }>
    ) => {
      return {
        ...state,
        parts: state.parts.map((part, index) => {
          if (index === action.payload.index) {
            return { ...part, show: action.payload.show };
          }
          return part;
        }),
      };
    },
    formatPartNumbers: (state) => {
      const partMap = new Map<string, number>();
      state.parts.forEach((part) => {
        const lastSpaceIndex = part.name.lastIndexOf(" ");
        let partName = part.name.substring(0, lastSpaceIndex);
        const partNumber = part.name.substring(lastSpaceIndex + 1);
        if (lastSpaceIndex === -1 || isNaN(Number(partNumber))) {
          partName = part.name;
        }

        if (partMap.has(partName)) {
          partMap.set(partName, partMap.get(partName)! + 1);
        } else {
          partMap.set(partName, 1);
        }
      });

      partMap.forEach((value, key) => {
        if (value === 1) {
          partMap.delete(key);
        }
      });

      const newParts: EditPart[] = [];
      for (let i = state.parts.length - 1; i >= 0; i--) {
        const lastSpaceIndex = state.parts[i].name.lastIndexOf(" ");
        let partName = state.parts[i].name.substring(0, lastSpaceIndex);
        const partNumber = state.parts[i].name.substring(lastSpaceIndex + 1);
        if (lastSpaceIndex === -1 || isNaN(Number(partNumber))) {
          partName = state.parts[i].name;
        }

        if (partMap.has(partName)) {
          const partNumber = partMap.get(partName)!;
          newParts.unshift({
            ...state.parts[i],
            name: `${partName} ${partNumber}`,
          });
          partMap.set(partName, partNumber - 1);
        } else {
          newParts.unshift({ ...state.parts[i], name: partName });
        }
      }
      return {
        ...state,
        parts: newParts,
      };
    },
    setPartInstruments: (
      state,
      action: PayloadAction<{ partIndex: number; instruments: Instrument[] }>
    ) => {
      const { partIndex, instruments } = action.payload;
      return {
        ...state,
        parts: state.parts.map((part, index) => {
          if (index === partIndex) {
            return {
              ...part,
              instruments: instruments,
            };
          }
          return part;
        }),
      };
    },
    pushPartInstrument: (
      state,
      action: PayloadAction<{ partIndex: number; instrument: Instrument }>
    ) => {
      const { partIndex, instrument } = action.payload;
      return {
        ...state,
        parts: state.parts.map((part, index) => {
          if (index === partIndex) {
            return {
              ...part,
              instruments: [...part.instruments, instrument],
            };
          }
          return part;
        }),
      };
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
        arrangers: piece.arrangers,
        transcribers: piece.transcribers,
        orchestrators: piece.orchestrators,
        lyricists: piece.lyricists,
        parts: piece.parts,
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
  setArrangers,
  setTranscribers,
  setOrchestrators,
  setLyricists,
  setParts,
  pushPart,
  removePart,
  updatePartName,
  setPartRenaming,
  setPartShow,
  formatPartNumbers,
  setPartInstruments,
  pushPartInstrument,
} = pieceSlice.actions;

export { getPiece };

export default pieceSlice.reducer;
