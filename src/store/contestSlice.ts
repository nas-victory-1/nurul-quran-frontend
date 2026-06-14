import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { ContestDetail, PageDetail, Question } from "@/types";

export type ContestPhase = "control" | "display" | "complete";

export interface ContestState {
  phase: ContestPhase;
  id: number | null;
  currentContestantId: string;
  currentQuestionIndex: number;
  currentPageNumber: number | null;
  currentPageImageUrl: string;
  currentPageDetail: PageDetail | null;
  contestantsDict: Record<string, string>;
  questionsDict: Record<string, Question[]>;
  questionsPerContestant: number;
  contestantIds: string[];
}

const initialState: ContestState = {
  phase: "control",
  id: null,
  currentContestantId: "1",
  currentQuestionIndex: 0,
  currentPageNumber: null,
  currentPageImageUrl: "",
  currentPageDetail: null,
  contestantsDict: {},
  questionsDict: {},
  contestantIds: [],
  questionsPerContestant: 0,
};

// Reducers are pure local state. Broadcasting to the projector and persisting
// state are done in the judge components via REST calls, because the backend
// is REST-driven (the server emits the socket events).
const contestSlice = createSlice({
  name: "contest",
  initialState,
  reducers: {
    revealQuestion: (state, action: PayloadAction<Question>) => {
      state.phase = "display";
      state.currentPageNumber = action.payload.pageNumber;
      state.currentPageImageUrl = action.payload.pageImageUrl;
      state.currentPageDetail = action.payload.detail;
    },
    // Set the live page (after the judge flips pages and we've fetched the
    // page descriptor for the new page number).
    setCurrentPage: (state, action: PayloadAction<PageDetail>) => {
      state.currentPageNumber = action.payload.page_number;
      state.currentPageImageUrl = action.payload.page_url;
      state.currentPageDetail = action.payload;
    },
    endQuestion: (state) => {
      const isLastQuestion =
        state.currentQuestionIndex === state.questionsPerContestant - 1;

      if (isLastQuestion) {
        const idx = state.contestantIds.indexOf(state.currentContestantId);
        const isLastContestant = idx === state.contestantIds.length - 1;

        if (isLastContestant) {
          state.phase = "complete";
        } else {
          state.currentContestantId = state.contestantIds[idx + 1];
          state.currentQuestionIndex = 0;
          state.phase = "control";
        }
      } else {
        state.currentQuestionIndex += 1;
        state.phase = "control";
      }

      state.currentPageNumber = null;
      state.currentPageImageUrl = "";
      state.currentPageDetail = null;
    },
    resetContest: (state) => {
      state.phase = "control";
      state.currentContestantId = state.contestantIds[0] ?? "1";
      state.currentQuestionIndex = 0;
      state.currentPageNumber = null;
      state.currentPageImageUrl = "";
      state.currentPageDetail = null;
    },
    setContestData: (state, action: PayloadAction<ContestDetail>) => {
      const { id, contestantsDict, questionsDict } = action.payload;
      state.id = id;
      state.contestantsDict = contestantsDict;
      state.questionsDict = questionsDict;
      state.contestantIds = Object.keys(contestantsDict);
      state.currentContestantId = state.contestantIds[0];
      state.currentQuestionIndex = 0;
      state.questionsPerContestant = Object.values(questionsDict)[0]?.length ?? 0;
      state.currentPageNumber = null;
      state.currentPageImageUrl = "";
      state.currentPageDetail = null;
      state.phase = "control";
    },
  },
});

export const {
  revealQuestion,
  setCurrentPage,
  endQuestion,
  resetContest,
  setContestData,
} = contestSlice.actions;

export default contestSlice.reducer;
