"use server";

// Server Actions for every write the app makes — all go through `apiServer`
// (Bearer token from our session cookie, auto-refresh on 401). Client
// components call these like normal async functions.

import { API_URL, ApiError, parseResponse } from "@/lib/api/envelope";
import { apiServer } from "@/lib/api/server";
import { getSessionTokens } from "@/lib/api/session";
import { CLASS_CODE_LENGTH } from "@/lib/constants";
import type {
  AttemptResult,
  ClassRoom,
  DeckEntry,
  DeckImportResult,
  DeckPreview,
  GameQuestion,
  GameSession,
  QuizSet,
  SrsGrade,
  SrsGradeResult,
  VocabDeck,
} from "@/lib/types";

export async function createClass(input: { name: string; description?: string }): Promise<ClassRoom> {
  const d = await apiServer<{
    id: string;
    name: string;
    code: string;
    teacherId: string;
    teacherName?: string;
    description?: string;
    status: "active" | "archived";
    studentCount: number;
    createdAt: string;
  }>("/classes", {
    method: "POST",
    body: { name: input.name.trim(), ...(input.description?.trim() ? { description: input.description.trim() } : {}) },
  });
  return { ...d, studentCount: d.studentCount ?? 0 };
}

/**
 * Result uses an error *code* (not a message) — Server Actions have no stable
 * locale, so the three client callers translate it via `useTranslations("joinErrors")`.
 */
export type JoinErrorCode = "code_length" | "not_found" | "class_full" | "unknown";
export type JoinClassResult =
  | { ok: true; classId: string; className: string }
  | { ok: false; error: JoinErrorCode };

export async function joinClassByCode(rawCode: string): Promise<JoinClassResult> {
  const code = rawCode.trim().toUpperCase();
  if (code.length !== CLASS_CODE_LENGTH) return { ok: false, error: "code_length" };

  try {
    const cls = await apiServer<{ id: string; name: string }>("/classes/join", { method: "POST", body: { code } });
    return { ok: true, classId: cls.id, className: cls.name };
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 404) return { ok: false, error: "not_found" };
      if (err.status === 403) return { ok: false, error: "class_full" };
    }
    return { ok: false, error: "unknown" };
  }
}

export interface ProfileInput {
  fullName?: string;
  avatarUrl?: string | null;
  /** ISO date (YYYY-MM-DD) or null to clear. */
  dateOfBirth?: string | null;
  bio?: string | null;
  learningGoal?: string | null;
  /** '' = show the highest unlocked title. */
  displayTitle?: string;
}

export async function updateProfile(input: ProfileInput): Promise<{ ok: boolean; error?: string }> {
  try {
    const body: Record<string, unknown> = {};
    if (input.fullName !== undefined) body.fullName = input.fullName.trim();
    if (input.avatarUrl !== undefined) body.avatarUrl = input.avatarUrl ?? "";
    if (input.dateOfBirth !== undefined) body.dateOfBirth = input.dateOfBirth ?? "";
    if (input.bio !== undefined) body.bio = (input.bio ?? "").trim();
    if (input.learningGoal !== undefined) body.learningGoal = (input.learningGoal ?? "").trim();
    if (input.displayTitle !== undefined) body.displayTitle = input.displayTitle;
    await apiServer("/users/me", { method: "PATCH", body });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof ApiError ? err.message : "Không lưu được hồ sơ." };
  }
}

/** Multipart, like `uploadGameImage` — uploads to Cloudinary and returns the URL to save via `updateProfile`. */
export async function uploadAvatar(formData: FormData): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  try {
    const tokens = await getSessionTokens();
    if (!tokens) return { ok: false, error: "Chưa đăng nhập." };
    const res = await fetch(`${API_URL}/uploads/avatar`, {
      method: "POST",
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
      body: formData,
    });
    const data = await parseResponse<{ url: string }>(res);
    return { ok: true, url: data.url };
  } catch (err) {
    return { ok: false, error: err instanceof ApiError ? err.message : "Không tải được ảnh lên." };
  }
}

export async function claimBirthdayGift(): Promise<{ granted: boolean; xp: number }> {
  try {
    return await apiServer<{ granted: boolean; xp: number }>("/gamification/birthday-gift", { method: "POST" });
  } catch {
    return { granted: false, xp: 0 };
  }
}

export async function createAssignment(input: {
  classId: string;
  title: string;
  mode: "quiz" | "matching";
  vocabulary: { word: string; ipa: string; meaning: string; example?: string }[];
  durationSeconds: number;
  deadline: string;
  questionCount?: number;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  try {
    const a = await apiServer<{ id: string }>("/assignments", {
      method: "POST",
      body: {
        classId: input.classId,
        title: input.title.trim(),
        mode: input.mode,
        vocabulary: input.vocabulary,
        durationSeconds: input.durationSeconds,
        deadline: input.deadline,
        ...(input.mode === "quiz" && input.questionCount ? { questionCount: input.questionCount } : {}),
      },
    });
    return { ok: true, id: a.id };
  } catch (err) {
    return { ok: false, error: err instanceof ApiError ? err.message : "Không tạo được bài tập." };
  }
}

export async function submitQuiz(
  assignmentId: string,
  input: { answers: { questionIndex: number; selectedKey: "A" | "B" | "C" | "D" | null }[]; timeTakenSeconds: number },
): Promise<{ ok: true; result: AttemptResult } | { ok: false; error: string }> {
  try {
    const result = await apiServer<AttemptResult>(`/assignments/${assignmentId}/submissions/quiz`, {
      method: "POST",
      body: input,
    });
    return { ok: true, result };
  } catch (err) {
    return { ok: false, error: err instanceof ApiError ? err.message : "Không nộp được bài." };
  }
}

/**
 * Grade one spaced-repetition card (again/hard/good/easy). The backend applies SM-2, updates the
 * streak and awards XP; the review UI advances its local queue from the returned result.
 */
export async function gradeSrsCard(
  cardId: string,
  grade: SrsGrade,
): Promise<{ ok: true; result: SrsGradeResult } | { ok: false; error: string }> {
  try {
    const result = await apiServer<SrsGradeResult>(`/srs/review/${cardId}`, { method: "POST", body: { grade } });
    return { ok: true, result };
  } catch (err) {
    return { ok: false, error: err instanceof ApiError ? err.message : "Không ghi được kết quả ôn tập." };
  }
}

// ---------------------------------------------------------------------------
// Shareable vocabulary decks ("bộ thẻ")
// ---------------------------------------------------------------------------

interface DeckInput {
  title: string;
  description?: string;
  /** A class the caller teaches — publishes the deck to that class library. "" detaches (edit only). */
  classId?: string;
  entries: DeckEntry[];
}

export async function createDeck(
  input: DeckInput,
): Promise<{ ok: true; deck: VocabDeck } | { ok: false; error: string }> {
  try {
    const deck = await apiServer<VocabDeck>("/decks", { method: "POST", body: { ...input } });
    return { ok: true, deck };
  } catch (err) {
    return { ok: false, error: err instanceof ApiError ? err.message : "Không tạo được bộ thẻ." };
  }
}

export async function updateDeck(
  id: string,
  input: Partial<DeckInput>,
): Promise<{ ok: true; deck: VocabDeck } | { ok: false; error: string }> {
  try {
    const deck = await apiServer<VocabDeck>(`/decks/${id}`, { method: "PATCH", body: { ...input } });
    return { ok: true, deck };
  } catch (err) {
    return { ok: false, error: err instanceof ApiError ? err.message : "Không lưu được bộ thẻ." };
  }
}

export async function deleteDeck(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await apiServer(`/decks/${id}`, { method: "DELETE" });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof ApiError ? err.message : "Không xoá được bộ thẻ." };
  }
}

/** Preview a deck by its share code before importing (client dialog can't call `apiServer` directly). */
export async function lookupDeck(shareCode: string): Promise<DeckPreview | null> {
  try {
    return await apiServer<DeckPreview>(`/decks/share/${encodeURIComponent(shareCode.trim())}`);
  } catch {
    return null;
  }
}

/** Add a deck to my spaced-repetition review — by share code, or by id from my class library. */
export async function importDeck(
  by: { shareCode: string } | { deckId: string },
): Promise<{ ok: true; result: DeckImportResult } | { ok: false; error: string }> {
  try {
    const result = await apiServer<DeckImportResult>("/decks/import", { method: "POST", body: by });
    return { ok: true, result };
  } catch (err) {
    return { ok: false, error: err instanceof ApiError ? err.message : "Không thêm được bộ thẻ." };
  }
}

/** Best-effort: a notification is a convenience, never worth failing the UI interaction over. */
export async function markNotificationRead(id: string): Promise<void> {
  try {
    await apiServer(`/notifications/${id}/read`, { method: "PATCH" });
  } catch {
    /* best-effort */
  }
}

export async function markAllNotificationsRead(): Promise<void> {
  try {
    await apiServer("/notifications/read-all", { method: "PATCH" });
  } catch {
    /* best-effort */
  }
}

export async function submitMatching(
  assignmentId: string,
  input: { matchedPairs: number; totalPairs: number; mistakes: number; timeTakenSeconds: number },
): Promise<{ ok: true; result: AttemptResult } | { ok: false; error: string }> {
  try {
    const result = await apiServer<AttemptResult>(`/assignments/${assignmentId}/submissions/matching`, {
      method: "POST",
      body: input,
    });
    return { ok: true, result };
  } catch (err) {
    return { ok: false, error: err instanceof ApiError ? err.message : "Không nộp được bài." };
  }
}

// ---------------------------------------------------------------------------
// Live minigame ("phòng chơi realtime")
// ---------------------------------------------------------------------------

/**
 * The only multipart request the app makes, so it can't go through `apiServer` (JSON-only) —
 * a thin, one-off equivalent instead. No auto-refresh-on-401 here (unlike `apiServer`): if the
 * access token has just expired mid-upload the teacher gets a clear error and can retry, which
 * by then has a fresh token from the proxy's own refresh-on-navigation.
 */
export async function uploadGameImage(formData: FormData): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  try {
    const tokens = await getSessionTokens();
    if (!tokens) return { ok: false, error: "Chưa đăng nhập." };
    const res = await fetch(`${API_URL}/uploads/image`, {
      method: "POST",
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
      body: formData,
    });
    const data = await parseResponse<{ url: string }>(res);
    return { ok: true, url: data.url };
  } catch (err) {
    return { ok: false, error: err instanceof ApiError ? err.message : "Không tải được ảnh lên." };
  }
}

export async function createQuizSet(input: {
  title: string;
  questions: GameQuestion[];
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  try {
    const quizSet = await apiServer<QuizSet>("/games/quiz-sets", { method: "POST", body: input });
    return { ok: true, id: quizSet.id };
  } catch (err) {
    return { ok: false, error: err instanceof ApiError ? err.message : "Không tạo được bộ câu hỏi." };
  }
}

export async function deleteQuizSet(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await apiServer(`/games/quiz-sets/${id}`, { method: "DELETE" });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof ApiError ? err.message : "Không xoá được bộ câu hỏi." };
  }
}

export async function createGameSession(input: {
  quizSetId: string;
  topCount: 3 | 5 | 10;
  classId?: string;
}): Promise<{ ok: true; session: GameSession } | { ok: false; error: string }> {
  try {
    const session = await apiServer<GameSession>("/games/sessions", { method: "POST", body: input });
    return { ok: true, session };
  } catch (err) {
    return { ok: false, error: err instanceof ApiError ? err.message : "Không tạo được phòng chơi." };
  }
}

/**
 * Multipart, like `uploadGameImage` — `formData` carries `prompt` (required), and optionally
 * `questionCount`, `sourceText`, `file` (a PDF/.txt "giáo trình"). Returns a **draft** (not
 * persisted backend-side): the caller drops `title`/`questions` into the builder form's own
 * state for the teacher to review/edit before the real `createQuizSet` save.
 */
export async function generateQuizSetWithAI(
  formData: FormData,
): Promise<{ ok: true; title: string; questions: GameQuestion[] } | { ok: false; error: string }> {
  try {
    const tokens = await getSessionTokens();
    if (!tokens) return { ok: false, error: "Chưa đăng nhập." };
    const res = await fetch(`${API_URL}/games/quiz-sets/generate`, {
      method: "POST",
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
      body: formData,
    });
    const data = await parseResponse<{ title: string; questions: GameQuestion[] }>(res);
    return { ok: true, title: data.title, questions: data.questions };
  } catch (err) {
    return { ok: false, error: err instanceof ApiError ? err.message : "Không tạo được câu hỏi bằng AI." };
  }
}
