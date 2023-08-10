import { configureStore } from "@reduxjs/toolkit";
import filesReducer from "../routes/EditWizard/filesSlice";
import pieceReducer from "../routes/EditWizard/pieceSlice";

const store = configureStore({
  reducer: {
    files: filesReducer,
    piece: pieceReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
