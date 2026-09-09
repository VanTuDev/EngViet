import { apiServer } from "@/lib/api/server";
import type { GamificationSummary } from "@/lib/types";

/** Level bar, unlocked titles, badges and streak-bonus state for the profile page. */
export async function getGamificationSummary(): Promise<GamificationSummary | null> {
  try {
    return await apiServer<GamificationSummary>("/gamification/me");
  } catch {
    return null;
  }
}
