"use server";

// Server Actions for every write the app makes — all go through `apiServer`
// (Bearer token from our session cookie, auto-refresh on 401). Client
// components call these like normal async functions.

import { ApiError } from "@/lib/api/envelope";
import { apiServer } from "@/lib/api/server";
import { CLASS_CODE_LENGTH } from "@/lib/constants";
import type { AttemptResult, ClassRoom } from "@/lib/types";

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

export async function updateProfile(input: { fullName: string }): Promise<{ ok: boolean; error?: string }> {
  try {
    await apiServer("/users/me", { method: "PATCH", body: { fullName: input.fullName.trim() } });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof ApiError ? err.message : "Không lưu được hồ sơ." };
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
