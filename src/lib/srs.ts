// Client-side helpers for the spaced-repetition review UI. `previewIntervalDays` mirrors the
// backend's `applySm2` interval branch (BE `src/srs/srs.constants.ts`) just closely enough to
// label the four grade buttons — the backend is always the source of truth for the real schedule.

import type { SrsCard, SrsGrade } from "@/lib/types";

/** Rough "next due in" for a grade, for the button sublabels. Returns days; `0` = a few minutes. */
export function previewIntervalDays(card: SrsCard, grade: SrsGrade): number {
  if (grade === "again") return 0;
  const reps = card.repetitions;
  if (reps === 0) return grade === "easy" ? 3 : 1;
  if (reps === 1) return grade === "hard" ? 4 : grade === "easy" ? 8 : 6;
  const ef = card.easeFactor || 2.5;
  const factor = grade === "hard" ? 1.2 : grade === "easy" ? ef * 1.3 : ef;
  return Math.max(card.intervalDays + 1, Math.round(card.intervalDays * factor));
}

/** "vài phút" | "1 ngày" | "3 ngày" — kept locale-neutral-ish; the review UI wraps it with t(). */
export function formatIntervalShort(days: number, t: (key: string, values?: Record<string, number>) => string): string {
  if (days <= 0) return t("intervalMinutes");
  if (days === 1) return t("intervalOneDay");
  if (days < 30) return t("intervalDays", { count: days });
  if (days < 365) return t("intervalMonths", { count: Math.round(days / 30) });
  return t("intervalYears", { count: Math.round(days / 365) });
}

/** Speak an English word/phrase with the browser's built-in TTS. No-op where unsupported. */
export function speakWord(text: string): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  } catch {
    /* TTS is a nicety, never surface an error */
  }
}

/** Highlights every occurrence of `word` inside `example` — returns segments for rendering. */
export function splitExampleAroundWord(example: string, word: string): { text: string; match: boolean }[] {
  if (!example || !word) return [{ text: example, match: false }];
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = example.split(new RegExp(`(${escaped}\\w*)`, "gi"));
  return parts.filter(Boolean).map((text) => ({ text, match: text.toLowerCase().startsWith(word.toLowerCase()) }));
}
