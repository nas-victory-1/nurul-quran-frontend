import {
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";

import { ENV } from "@/config/env";
import { resetAuth } from "@/store/authSlice";
import type { RootState } from "@/store";

// Base query attaches the bearer token from the auth slice to every request.
const rawBaseQuery = fetchBaseQuery({
  baseUrl: ENV.API_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

// Wrap the base query so a 401 clears the session (forces re-login).
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  if (result.error?.status === 401) {
    api.dispatch(resetAuth());
  }
  return result;
};

// Single API slice; feature endpoints are added with injectEndpoints.
export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Contest"],
  endpoints: () => ({}),
});
