import { apiServer } from "@/lib/api/server";
import type { LeaderboardEntry } from "@/lib/types";

export async function getAssignmentLeaderboard(assignmentId: string): Promise<LeaderboardEntry[]> {
  return apiServer<LeaderboardEntry[]>(`/leaderboard/assignments/${assignmentId}`);
}

export async function getClassLeaderboard(classId: string): Promise<LeaderboardEntry[]> {
  return apiServer<LeaderboardEntry[]>(`/leaderboard/classes/${classId}`);
}
