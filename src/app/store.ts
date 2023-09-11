import { configureStore } from "@reduxjs/toolkit";
import filesReducer from "../routes/EditWizard/filesSlice";
import pieceReducer from "../routes/EditWizard/pieceSlice";
import musiciansReducer from "../routes/EditWizard/MainPanel/Wizard/musiciansSlice";
import queryReducer from "../routes/Dashboard/MainPanel/querySlice";
import previewReducer from "../routes/Dashboard/reducers/previewSlice";
import filterReducer from "../routes/Dashboard/reducers/filterSlice";
import tagsReducer from "../routes/Dashboard/reducers/tagsSlice";
import piecesReducer from "../routes/Dashboard/reducers/piecesSlice";
import setlistReducer from "../routes/Dashboard/reducers/setlistSlice";
import setlistsReducer from "../routes/Dashboard/reducers/setlistsSlice";
import loadingReducer from "../routes/EditWizard/loadingSlice";

const store = configureStore({
  reducer: {
    files: filesReducer,
    piece: pieceReducer,
    musicians: musiciansReducer,
    query: queryReducer,
    preview: previewReducer,
    filter: filterReducer,
    tags: tagsReducer,
    pieces: piecesReducer,
    setlist: setlistReducer,
    setlists: setlistsReducer,
    loading: loadingReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
