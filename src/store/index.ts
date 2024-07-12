import { configureStore } from "@reduxjs/toolkit";
import queryReducer from "@/App/routes/Dashboard/MainPanel/querySlice";
import sortingReducer from "@/App/routes/Dashboard/MainPanel/sortSlice";
import filterReducer from "@/App/routes/Dashboard/reducers/filterSlice";
import piecesReducer from "@/App/routes/Dashboard/reducers/piecesSlice";
import previewReducer from "@/App/routes/Dashboard/reducers/previewSlice";
import setlistReducer from "@/App/routes/Dashboard/reducers/setlistSlice";
import setlistsReducer from "@/App/routes/Dashboard/reducers/setlistsSlice";
import tagsReducer from "@/App/routes/Dashboard/reducers/tagsSlice";

const store = configureStore({
  reducer: {
    query: queryReducer,
    preview: previewReducer,
    filter: filterReducer,
    tags: tagsReducer,
    pieces: piecesReducer,
    setlist: setlistReducer,
    setlists: setlistsReducer,
    sorting: sortingReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
