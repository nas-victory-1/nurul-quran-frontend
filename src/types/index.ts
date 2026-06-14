// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export type AuthUser = {
  id: string;
  phoneNumber: string;
  organisationName: string | null;
};

export type AuthState = {
  isAuthenticated: boolean;
  token: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
};

// Backend login returns a message, a signed JWT, and the organisation name
// (no user object and no refresh token). Identity (id/phone) is decoded from
// the token client-side; organisationName may be null.
export interface LoginResponse {
  message: string;
  token: string;
  organisationName: string | null;
}

// Claims encoded in the JWT (see backend account controller `app.jwt.sign`).
export interface JwtClaims {
  id: string;
  phone: string;
  iat?: number;
}

// ---------------------------------------------------------------------------
// Quran pages
// ---------------------------------------------------------------------------

// Full page descriptor as built by the backend (generate-pages / current-page).
export interface PageDetail {
  page_number: number;
  page_url: string;
  first_verse_on_page_chapter_name: string;
  first_verse_on_page_chapter_name_arabic: string;
  first_verse_on_page_chapter_number: string;
  first_verse_on_page_verse_number: string;
}

// Raw entry returned by GET /quran/pages/:page_number (different key names).
export interface PageInfo {
  page_number: number;
  first_verse_chapter_number: number;
  first_verse_number: number;
  first_verse_chapter_name: string;
  first_verse_chapter_name_arabic: string;
}

export interface GetPageResponse {
  success: boolean;
  page: PageInfo;
  pageUrl: string;
}

// ---------------------------------------------------------------------------
// Contest (domain models — camelCase, used inside the app)
// ---------------------------------------------------------------------------
export type Question = {
  pageNumber: number;
  pageImageUrl: string;
  // Full descriptor needed to drive the projector via current-page/show.
  detail: PageDetail;
};

export type Contestant = {
  id?: number;
  name: string;
};

export type Contest = {
  id: number;
  name: string;
  date: string;
  startSurahRange: number;
  endSurahRange: number;
  questionsPerContestant: number;
  contestants: Contestant[];
};

// The hydrated contest used to run the judge panel.
export interface ContestDetail {
  id: number;
  contestantsDict: Record<string, string>;
  questionsDict: Record<string, Question[]>;
}

// ---------------------------------------------------------------------------
// API requests / responses (match the Fastify backend exactly)
// ---------------------------------------------------------------------------

// A single contest as stored by Prisma (snake_case). The list endpoint does
// NOT include contestants, so that field is optional.
export interface ContestResponse {
  id: number;
  name: string;
  date: string;
  start_surah_range: number;
  end_surah_range: number;
  questions_per_contestant: number;
  organizationId?: string;
  contestants?: { id: number; name: string; contestId: number }[];
}

export interface ListContestsResponse {
  success: boolean;
  contests: ContestResponse[];
}

export interface CreateContestResponse {
  success: boolean;
  contest: ContestResponse;
}

// generate-pages returns this top-level shape (no success wrapper on success).
export interface ContestDetailResponse {
  id: number;
  contestants: Record<string, string>;
  questions: Record<string, PageDetail[]>;
}

// Backend createContest reads camelCase keys.
export interface CreateContestRequest {
  name: string;
  date: string;
  startSurahRange: number;
  endSurahRange: number;
  questionsPerContestant: number;
  contestants: { name: string }[];
}

export interface ContestStateResponse {
  success: boolean;
  state: {
    id: number;
    contestId: number;
    contestant_name: string | null;
    page_number: number | null;
    question_string: string | null;
  };
}
