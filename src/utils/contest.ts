import type {
  Contest,
  ContestDetail,
  ContestDetailResponse,
  ContestResponse,
  Question,
} from "@/types";

// Map the snake_case contest list response to camelCase domain models.
// NOTE: the list endpoint does not include contestants, so the count may be 0.
export const mapContests = (data: ContestResponse[]): Contest[] =>
  data.map((c) => ({
    id: c.id,
    name: c.name,
    date: c.date,
    startSurahRange: c.start_surah_range,
    endSurahRange: c.end_surah_range,
    questionsPerContestant: c.questions_per_contestant,
    contestants: (c.contestants ?? []).map((ct) => ({
      id: ct.id,
      name: ct.name,
    })),
  }));

// Map the "generate-pages" response into the structure the judge panel runs on.
// The full PageDetail is preserved so the judge can drive the projector via
// the current-page/show endpoint.
export const mapContestData = (data: ContestDetailResponse): ContestDetail => {
  const questionsDict: Record<string, Question[]> = {};

  for (const [id, pages] of Object.entries(data.questions)) {
    questionsDict[id] = pages.map((p) => ({
      pageNumber: p.page_number,
      pageImageUrl: p.page_url,
      detail: p,
    }));
  }

  return {
    id: data.id,
    contestantsDict: data.contestants,
    questionsDict,
  };
};
