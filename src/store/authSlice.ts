import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { AuthState } from "@/types";

const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
  refreshToken: null,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<AuthState>) => {
      state.isAuthenticated = action.payload.isAuthenticated;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.user = action.payload.user;
    },
    resetAuth: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.refreshToken = null;
      state.user = null;
    },
  },
});

export const { setAuth, resetAuth } = authSlice.actions;
export default authSlice.reducer;
