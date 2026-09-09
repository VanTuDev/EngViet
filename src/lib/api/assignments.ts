import { apiServer } from "@/lib/api/server";
import type { Paginated } from "@/lib/api/envelope";
import type { Assignment, QuizQuestion, VocabularyItem } from "@/lib/types";

interface RawVocab {
  word: string;
  ipa: string;
  meaning: string;
  example?: string;
}
interface RawQuestion {
  id?: string;
  prompt: string;
  options: { key: "A" | "B" | "C" | "D"; text: string }[];
  correctKey?: "A" | "B" | "C" | "D";
}
interface AssignmentDto {
  id: string;
  classId: string;
  title: string;
  mode: "quiz" | "matching";
  vocabulary: RawVocab[];
  questions: RawQuestion[];
  durationSeconds: number;
  deadline: string;
  published?: boolean;
  createdAt?: string;
}

/** Vocabulary/questions come back without stable ids; synthesize deterministic ones so React keys + drag state stay stable. */
function withIds(dto: AssignmentDto): Assignment {
  const vocabulary: VocabularyItem[] = dto.vocabulary.map((v, i) => ({
    id: `${dto.id}-v${i}`,
    word: v.word,
    ipa: v.ipa,
    meaning: v.meaning,
    example: v.example ?? "",
  }));
  const questions: QuizQuestion[] = dto.questions.map((q, i) => ({
    id: q.id ?? `${dto.id}-q${i}`,
    prompt: q.prompt,
    options: q.options,
    correctKey: q.correctKey ?? "A",
  }));
  return {
    id: dto.id,
    classId: dto.classId,
    title: dto.title,
    mode: dto.mode,
    vocabulary,
    questions,
    durationSeconds: dto.durationSeconds,
    deadline: dto.deadline,
    published: dto.published ?? true,
    createdAt: dto.createdAt ?? new Date().toISOString(),
  };
}

/**
 * List assignments — one class, or (no `classId`) every assignment across the caller's classes.
 * `scope: "owned"` for the teacher workspace, `"enrolled"` for the student one — a dual-capable
 * user (verified student acting as teacher) must pass it explicitly.
 */
export async function getAssignments(classId?: string, scope?: "owned" | "enrolled"): Promise<Assignment[]> {
  const qs = new URLSearchParams({ limit: "100" });
  if (classId) qs.set("classId", classId);
  if (scope) qs.set("scope", scope);
  const res = await apiServer<Paginated<AssignmentDto>>(`/assignments?${qs.toString()}`);
  return res.data.map(withIds);
}

/** Full detail incl. answer key — teacher (owner) or admin only. */
export async function getAssignment(id: string): Promise<Assignment | null> {
  try {
    return withIds(await apiServer<AssignmentDto>(`/assignments/${id}`));
  } catch {
    return null;
  }
}

/** Sanitized version a student is about to attempt (no answer key). */
export async function getPlayableAssignment(id: string): Promise<Assignment | null> {
  try {
    return withIds(await apiServer<AssignmentDto>(`/assignments/${id}/play`));
  } catch {
    return null;
  }
}

/**
 * Every assignment across the caller's own classes whose deadline falls within `[from, to)` —
 * backs the exam schedule/calendar view. `from`/`to` are ISO instants.
 */
export async function getAssignmentsInRange(
  from: string,
  to: string,
  scope?: "owned" | "enrolled",
): Promise<Assignment[]> {
  const qs = new URLSearchParams({ limit: "100", from, to });
  if (scope) qs.set("scope", scope);
  const res = await apiServer<Paginated<AssignmentDto>>(`/assignments?${qs.toString()}`);
  return res.data.map(withIds);
}
