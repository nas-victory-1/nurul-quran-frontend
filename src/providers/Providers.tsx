"use client";

import { type ReactNode } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { ToastContainer } from "react-toastify";

import { store, persistor } from "@/store";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
        <ToastContainer position="top-right" autoClose={3000} />
      </PersistGate>
    </Provider>
  );
}
