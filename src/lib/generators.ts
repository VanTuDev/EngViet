// Pure, dependency-free generators that turn a teacher's vocabulary bank into
// playable content. This models UC05: "hệ thống tự sinh dữ liệu thành bài
// ghép từ và trắc nghiệm" — the system auto-generates matching + quiz
// exercises from an imported Excel vocabulary list.
//
// Shuffling is seeded (mulberry32) instead of Math.random() so the exact
// same assignment id always produces the same question/option order on both
// server and client renders, which avoids React hydration mismatches.

import type { QuizOption, QuizQuestion, VocabularyItem } from "@/lib/types";

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return function random() {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function stringSeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function seededShuffle<T>(items: readonly T[], seed: number): T[] {
  const rng = mulberry32(seed);
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j] as T, result[i] as T];
  }
  return result;
}

const OPTION_KEYS: QuizOption["key"][] = ["A", "B", "C", "D"];

/**
 * Builds ABCD questions asking for the Vietnamese meaning of each word, with
 * distractor meanings drawn from the rest of the vocabulary bank.
 */
export function generateQuizFromVocabulary(
  vocabulary: VocabularyItem[],
  opts: { seedKey: string; questionCount?: number },
): QuizQuestion[] {
  if (vocabulary.length < 4) return [];
  const seed = stringSeed(opts.seedKey);
  const order = seededShuffle(vocabulary, seed);
  const count = Math.min(opts.questionCount ?? vocabulary.length, vocabulary.length);

  return order.slice(0, count).map((item, index) => {
    const distractorPool = vocabulary.filter((v) => v.id !== item.id);
    const distractors = seededShuffle(distractorPool, seed + index * 7919).slice(0, 3);
    const optionValues = seededShuffle([item, ...distractors], seed + index * 104729);

    const options: QuizOption[] = optionValues.map((option, optionIndex) => ({
      key: OPTION_KEYS[optionIndex] as QuizOption["key"],
      text: option.meaning,
    }));
    const correctOption = options[optionValues.findIndex((o) => o.id === item.id)];

    return {
      id: `${item.id}-q${index}`,
      prompt: `"${item.word}" (${item.ipa}) có nghĩa là gì?`,
      options,
      correctKey: (correctOption?.key ?? "A") as QuizOption["key"],
    } satisfies QuizQuestion;
  });
}

export interface MatchingCard {
  id: string;
  pairId: string;
  side: "word" | "meaning";
  label: string;
}

/** Splits vocabulary into two independently-shuffled columns for the matching game. */
export function generateMatchingBoard(
  vocabulary: VocabularyItem[],
  opts: { seedKey: string; pairCount?: number },
): { words: MatchingCard[]; meanings: MatchingCard[] } {
  const seed = stringSeed(opts.seedKey);
  const count = Math.min(opts.pairCount ?? vocabulary.length, vocabulary.length);
  const chosen = seededShuffle(vocabulary, seed).slice(0, count);

  const words = seededShuffle(
    chosen.map((item) => ({ id: `${item.id}-word`, pairId: item.id, side: "word" as const, label: item.word })),
    seed + 17,
  );
  const meanings = seededShuffle(
    chosen.map((item) => ({ id: `${item.id}-meaning`, pairId: item.id, side: "meaning" as const, label: item.meaning })),
    seed + 31,
  );

  return { words, meanings };
}
