import { apiServer } from "@/lib/api/server";
import type { SrsInsights, SrsReviewQueue, SrsSummary } from "@/lib/types";

/** Today's spaced-repetition queue — review-due cards plus the day's new-card allowance. Student only. */
export async function getSrsReviewQueue(): Promise<SrsReviewQueue> {
  return apiServer<SrsReviewQueue>("/srs/review");
}

/** Lightweight counts + streak for the student dashboard widget. */
export async function getSrsSummary(): Promise<SrsSummary | null> {
  try {
    return await apiServer<SrsSummary>("/srs/summary");
  } catch {
    return null;
  }
}

/** A class's vocabulary-retention insights (hardest words, streaks, who needs a nudge). Teacher only. */
export async function getSrsInsights(classId: string): Promise<SrsInsights | null> {
  try {
    return await apiServer<SrsInsights>(`/srs/insights/classes/${classId}`);
  } catch {
    return null;
  }
}
