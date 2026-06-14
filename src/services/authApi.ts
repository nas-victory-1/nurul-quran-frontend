import { api } from "./api";
import type { LoginResponse } from "@/types";

export const authApi = api.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation<
            LoginResponse,
            { phoneNumber: string; password: string }
        >({
            query: (credentials) => ({
                url: "/api/account/login",
                method: "POST",
                body: credentials,
            }),
        }),
    }),
});

export const { useLoginMutation } = authApi;
