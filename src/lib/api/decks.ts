import { apiServer } from "@/lib/api/server";
import type { DeckSummary, VocabDeck } from "@/lib/types";

/** Decks I own (personal + any I published to a class). */
export async function getMyDecks(): Promise<DeckSummary[]> {
  return apiServer<DeckSummary[]>("/decks/mine");
}

/** Full deck with entries — owner, or a member of its class. `null` if not found / no access. */
export async function getDeck(id: string): Promise<VocabDeck | null> {
  try {
    return await apiServer<VocabDeck>(`/decks/${id}`);
  } catch {
    return null;
  }
}

/** The deck library a teacher published to a class (caller must be enrolled or teach it). */
export async function getClassDeckLibrary(classId: string): Promise<DeckSummary[]> {
  try {
    return await apiServer<DeckSummary[]>(`/decks/classes/${classId}`);
  } catch {
    return [];
  }
}
