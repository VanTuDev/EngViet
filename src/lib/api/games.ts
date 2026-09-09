import { apiServer } from "@/lib/api/server";
import type { Paginated } from "@/lib/api/envelope";
import type { GameLeaderboardEntry, GameSession, QuizSet, QuizSetSummary } from "@/lib/types";

export async function getMyQuizSets(): Promise<QuizSetSummary[]> {
  const res = await apiServer<Paginated<QuizSetSummary>>("/games/quiz-sets?limit=100");
  return res.data;
}

export async function getQuizSet(id: string): Promise<QuizSet | null> {
  try {
    return await apiServer<QuizSet>(`/games/quiz-sets/${id}`);
  } catch {
    return null;
  }
}

export async function getGameSession(id: string): Promise<GameSession | null> {
  try {
    return await apiServer<GameSession>(`/games/sessions/${id}`);
  } catch {
    return null;
  }
}

/** Public-ish pre-join lookup — confirms a PIN is real and still joinable before the student's socket connects. */
export async function getGameSessionByPin(pin: string): Promise<GameSession | null> {
  try {
    return await apiServer<GameSession>(`/games/sessions/by-pin/${encodeURIComponent(pin)}`);
  } catch {
    return null;
  }
}

export async function getGameResults(sessionId: string): Promise<GameLeaderboardEntry[]> {
  return apiServer<GameLeaderboardEntry[]>(`/games/sessions/${sessionId}/results`);
}
