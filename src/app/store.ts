import { configureStore } from "@reduxjs/toolkit";
import filesReducer from "../routes/EditWizard/filesSlice";
import pieceReducer from "../routes/EditWizard/pieceSlice";
import musiciansReducer from "../routes/EditWizard/MainPanel/Wizard/musiciansSlice";
import queryReducer from "../routes/Dashboard/MainPanel/querySlice";
import previewReducer from "../routes/Dashboard/previewSlice";

const store = configureStore({
  reducer: {
    files: filesReducer,
    piece: pieceReducer,
    musicians: musiciansReducer,
    query: queryReducer,
    preview: previewReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
