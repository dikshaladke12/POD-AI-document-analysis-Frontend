import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import { combineReducers } from "redux";
import storage from "redux-persist/lib/storage";
import AuthSlice from "../Shared/Slice/AuthSlice";
import ProfileSlice from "../Shared/Slice/ProfileSlice";
import LoaderSlice from "../Shared/Slice/LoaderSlice";
import SidebarReducer from "../Shared/Slice/SidebarSlice";

const rootReducer = combineReducers({
  auth: AuthSlice,
  user: ProfileSlice,
  loader: LoaderSlice,
  sidebar: SidebarReducer,
});

const persistConfig = {
  key: "root",
  storage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export const persistor = persistStore(store);
