import { configureStore } from "@reduxjs/toolkit";
import queryReducer from "../routes/Dashboard/MainPanel/querySlice";
import filterReducer from "../routes/Dashboard/reducers/filterSlice";
import piecesReducer from "../routes/Dashboard/reducers/piecesSlice";
import previewReducer from "../routes/Dashboard/reducers/previewSlice";
import setlistReducer from "../routes/Dashboard/reducers/setlistSlice";
import setlistsReducer from "../routes/Dashboard/reducers/setlistsSlice";
import tagsReducer from "../routes/Dashboard/reducers/tagsSlice";

const store = configureStore({
  reducer: {
    query: queryReducer,
    preview: previewReducer,
    filter: filterReducer,
    tags: tagsReducer,
    pieces: piecesReducer,
    setlist: setlistReducer,
    setlists: setlistsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
