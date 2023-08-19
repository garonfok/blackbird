import { configureStore } from "@reduxjs/toolkit";
import filesReducer from "../routes/EditWizard/filesSlice";
import pieceReducer from "../routes/EditWizard/pieceSlice";
import musiciansReducer from "../routes/EditWizard/MainPanel/Wizard/musiciansSlice";

const store = configureStore({
  reducer: {
    files: filesReducer,
    piece: pieceReducer,
    musicians: musiciansReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
