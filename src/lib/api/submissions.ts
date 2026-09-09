import { apiServer } from "@/lib/api/server";
import type { AttemptResult, LeaderboardEntry, XpReward } from "@/lib/types";

interface SubmissionResultDto {
  id: string;
  assignmentId: string;
  studentId: string;
  mode: "quiz" | "matching";
  score: number;
  correctCount: number;
  totalCount: number;
  timeTakenSeconds: number;
  submittedAt: string;
  review?: AttemptResult["review"];
  xp?: XpReward & { totalXp: number };
}

function toResult(d: SubmissionResultDto, studentName?: string): AttemptResult {
  return { ...d, studentName };
}

/** Every submission the current student has made (assignment list / dashboard "đã làm?"). */
export async function getMySubmissions(): Promise<AttemptResult[]> {
  const rows = await apiServer<SubmissionResultDto[]>("/submissions/mine");
  return rows.map((r) => toResult(r));
}

export async function getMyResult(assignmentId: string): Promise<AttemptResult | null> {
  try {
    return toResult(await apiServer<SubmissionResultDto>(`/assignments/${assignmentId}/submissions/me`));
  } catch {
    return null;
  }
}

/** Teacher report table for an assignment — the ranked leaderboard doubles as the results list (it carries student names). */
export async function getAssignmentResults(assignmentId: string): Promise<LeaderboardEntry[]> {
  return apiServer<LeaderboardEntry[]>(`/leaderboard/assignments/${assignmentId}`);
}
