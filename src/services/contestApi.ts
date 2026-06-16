import { api } from "./api";
import type {
    ContestDetailResponse,
    ContestStateResponse,
    CreateContestRequest,
    CreateContestResponse,
    GetPageResponse,
    ListContestsResponse,
    PageDetail,
} from "@/types";

export const contestApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getContests: builder.query<ListContestsResponse, void>({
            query: () => ({ url: "/api/quiz/contests", method: "GET" }),
            providesTags: ["Contest"],
        }),

        deleteContest: builder.mutation<
            { success: boolean },
            { contestId: string }
        >({
            query: ({ contestId }) => ({
                url: `/api/quiz/contests/${contestId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Contest"],
        }),

        updateContest: builder.mutation<
            CreateContestResponse,
            CreateContestRequest & { contestId: string }
        >({
            query: ({ contestId, ...data }) => ({
                url: `/api/quiz/contests/${contestId}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Contest"],
        }),

        createContest: builder.mutation<
            CreateContestResponse,
            CreateContestRequest
        >({
            query: (data) => ({
                url: "/api/quiz/contests",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Contest"],
        }),

        // Hydrates the judge panel: contestants + their randomly generated pages.
        getContestData: builder.query<
            ContestDetailResponse,
            { contestId: string }
        >({
            query: ({ contestId }) => ({
                // NOTE: no trailing slash — Fastify routes are exact by default.
                url: `/api/quiz/quran/generate-pages?contest_id=${contestId}`,
                method: "GET",
            }),
        }),

        // Single page descriptor — used when the judge flips pages mid-question.
        getPageByNumber: builder.query<GetPageResponse, { pageNumber: number }>(
            {
                query: ({ pageNumber }) => ({
                    url: `/api/quiz/quran/pages/${pageNumber}`,
                    method: "GET",
                }),
            },
        ),

        // --- Projector control (server re-broadcasts over Socket.IO) ---

        // Show a page on the `contest_pages` room.
        showCurrentPage: builder.mutation<
            { success: boolean },
            { page_url: PageDetail }
        >({
            query: (body) => ({
                url: "/api/quiz/quran/current-page/show",
                method: "POST",
                body,
            }),
        }),

        // Clear the projector (emits page_update { action: "remove" }).
        removeCurrentPage: builder.mutation<{ pages_removed: boolean }, void>({
            query: () => ({
                url: "/api/quiz/quran/current-page",
                method: "DELETE",
            }),
        }),

        // Broadcast the contestant / question to the `contestants` room.
        broadcastContestants: builder.mutation<
            { success: boolean },
            { contestantName: string; questionString: string }
        >({
            query: (body) => ({
                url: "/api/quiz/contestants/broadcast",
                method: "POST",
                body,
            }),
        }),

        // --- Server-side persistence of the live state (for projector recovery) ---
        saveContestState: builder.mutation<
            ContestStateResponse,
            {
                contestId: string;
                contestantName: string;
                pageNumber: number | null;
                questionString: string;
            }
        >({
            query: ({ contestId, ...body }) => ({
                url: `/api/quiz/contests/${contestId}/state`,
                method: "POST",
                body,
            }),
        }),

        getContestState: builder.query<
            ContestStateResponse,
            { contestId: string }
        >({
            query: ({ contestId }) => ({
                url: `/api/quiz/contests/${contestId}/state`,
                method: "GET",
            }),
        }),
    }),
});

export const {
    useGetContestsQuery,
    useDeleteContestMutation,
    useUpdateContestMutation,
    useCreateContestMutation,
    useLazyGetContestDataQuery,
    useGetContestDataQuery,
    useLazyGetPageByNumberQuery,
    useShowCurrentPageMutation,
    useRemoveCurrentPageMutation,
    useBroadcastContestantsMutation,
    useSaveContestStateMutation,
    useGetContestStateQuery,
} = contestApi;
