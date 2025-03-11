import { combineReducers, configureStore } from "@reduxjs/toolkit";

import userReducer from "./user/userSlice.js";
import expandReducer from "./expand/expandSlice.js";
import taskTabsReducer from "./expand/taskTabsSlice.js";
import searchReducer from "./search/searchSlice.js";

import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";

const rootReducer = combineReducers({
  user: userReducer,
  expand: expandReducer,
  taskTabs: taskTabsReducer,
  search: searchReducer,
});

const persistConfig = {
  key: "root",
  storage,
  version: 1,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
