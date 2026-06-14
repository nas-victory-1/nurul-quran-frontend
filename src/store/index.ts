import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
    FLUSH,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
    REHYDRATE,
    persistReducer,
    persistStore,
} from "redux-persist";
// import storage from "redux-persist/lib/storage";

import { api } from "@/services/api";
import authReducer from "@/store/authSlice";
import contestReducer from "@/store/contestSlice";

const createNoopStorage = () => ({
    getItem() {
        return Promise.resolve(null);
    },
    setItem() {
        return Promise.resolve();
    },
    removeItem() {
        return Promise.resolve();
    },
});

const storage =
    typeof window !== "undefined"
        ? require("redux-persist/lib/storage").default
        : createNoopStorage();

const rootReducer = combineReducers({
    auth: authReducer,
    contest: contestReducer,
    [api.reducerPath]: api.reducer,
});

const persistConfig = {
    key: "root",
    storage,
    // Persist auth (stay logged in) and contest (survive judge-panel reloads).
    whitelist: ["auth", "contest"],
    blacklist: [api.reducerPath],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            // redux-persist actions carry non-serialisable values.
            serializableCheck: {
                ignoredActions: [
                    FLUSH,
                    REHYDRATE,
                    PAUSE,
                    PERSIST,
                    PURGE,
                    REGISTER,
                ],
            },
        }).concat(api.middleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
