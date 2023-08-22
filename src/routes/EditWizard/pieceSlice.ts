import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  Musician,
  EditPart,
  Tag,
  Instrument,
  EditScore,
  ByteFile,
  EditPiece,
} from "../../app/types";
import { invoke } from "@tauri-apps/api";

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
  scores: [
    {
      id: 1,
      name: "Full score",
      renaming: false,
      file: null,
    },
  ],
};

const getPiece = createAsyncThunk("editPiece/getPiece", async (id: number) => {
  const piece = await invoke("pieces_get_by_id", { id });
  return piece;
});

export const pieceSlice = createSlice({
  name: "piece",
  initialState: initialState,
  reducers: {
    setPiece: (_, action: PayloadAction<EditPiece>) => {
      return action.payload;
    },
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
    removePartInstrument: (
      state,
      action: PayloadAction<{ partIndex: number; instrumentIndex: number }>
    ) => {
      const { partIndex, instrumentIndex } = action.payload;
      return {
        ...state,
        parts: state.parts.map((part, index) => {
          if (index === partIndex) {
            return {
              ...part,
              instruments: part.instruments.filter(
                (_, index) => index !== instrumentIndex
              ),
            };
          }
          return part;
        }),
      };
    },
    setPartFile: (
      state,
      action: PayloadAction<{ partIndex: number; file: ByteFile }>
    ) => {
      const { partIndex, file } = action.payload;
      return {
        ...state,
        parts: state.parts.map((part, index) => {
          if (index === partIndex) {
            return {
              ...part,
              file: file,
            };
          }
          return part;
        }),
      };
    },
    removePartFile: (state, action: PayloadAction<number>) => {
      return {
        ...state,
        parts: state.parts.map((part, index) => {
          if (index === action.payload) {
            return {
              ...part,
              file: null,
            };
          }
          return part;
        }),
      };
    },
    setScores: (state, action: PayloadAction<EditScore[]>) => {
      state.scores = action.payload;
    },
    pushScore: (state, action: PayloadAction<EditScore>) => {
      state.scores.push(action.payload);
    },
    removeScore: (state, action: PayloadAction<number>) => {
      return {
        ...state,
        scores: state.scores.filter((_, index) => index !== action.payload),
      };
    },
    updateScoreName: (
      state,
      action: PayloadAction<{ index: number; name: string }>
    ) => {
      return {
        ...state,
        scores: state.scores.map((score, index) => {
          if (index === action.payload.index) {
            return { ...score, name: action.payload.name };
          }
          return score;
        }),
      };
    },
    setScoreRenaming: (
      state,
      action: PayloadAction<{ scoreIndex: number; renaming: boolean }>
    ) => {
      const { scoreIndex, renaming } = action.payload;
      return {
        ...state,
        scores: state.scores.map((score, index) => {
          if (index === scoreIndex) {
            return { ...score, renaming: renaming };
          }
          return score;
        }),
      };
    },
    setScoreFile: (
      state,
      action: PayloadAction<{ scoreIndex: number; file: ByteFile }>
    ) => {
      const { scoreIndex, file } = action.payload;
      return {
        ...state,
        scores: state.scores.map((score, index) => {
          if (index === scoreIndex) {
            return {
              ...score,
              file: file,
            };
          }
          return score;
        }),
      };
    },
    removeScoreFile: (state, action: PayloadAction<number>) => {
      return {
        ...state,
        scores: state.scores.map((score, index) => {
          if (index === action.payload) {
            return {
              ...score,
              file: null,
            };
          }
          return score;
        }),
      };
    },
    cleanPiece: (state, action: PayloadAction<number>) => {
      return {
        ...state,
        scores: state.scores.map((score) => {
          if (score.file?.id === action.payload) {
            return {
              ...score,
              file: null,
            };
          }
          return score;
        }),
        parts: state.parts.map((part) => {
          if (part.file?.id === action.payload) {
            return {
              ...part,
              file: null,
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
        scores: piece.scores,
      };
      return result;
    });
  },
});

export const {
  setPiece,
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
  removePartInstrument,
  setPartFile,
  removePartFile,
  setScores,
  pushScore,
  removeScore,
  updateScoreName,
  setScoreRenaming,
  setScoreFile,
  removeScoreFile,
  cleanPiece,
} = pieceSlice.actions;

export { getPiece };

export default pieceSlice.reducer;
