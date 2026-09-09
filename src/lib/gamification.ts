// Pure level / title / badge helpers, mirroring `BE/src/gamification/gamification.constants.ts`.
// Labels + descriptions for titles and badges live in `messages/*.json` (`dash.gamification.*`);
// this file is only the shape and the maths. The backend is always the source of truth for a
// user's actual level, badges and XP.

/** Cumulative XP to reach `level` — must match the backend's `xpForLevel`. */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return 50 * (level - 1) * level;
}

export interface LevelInfo {
  level: number;
  levelXp: number;
  span: number;
  toNext: number;
  progress: number;
}

export function levelFromXp(xp: number): LevelInfo {
  const safe = Math.max(0, Math.floor(xp || 0));
  let level = 1;
  while (xpForLevel(level + 1) <= safe) level++;
  const start = xpForLevel(level);
  const span = xpForLevel(level + 1) - start;
  const levelXp = safe - start;
  return { level, levelXp, span, toNext: span - levelXp, progress: span > 0 ? levelXp / span : 1 };
}

// ── Titles ──────────────────────────────────────────────────────────────────

export const TITLE_CODES = [
  "newcomer",
  "diligent",
  "word_hunter",
  "vocab_ace",
  "scholar",
  "ielts_master",
  "legend",
] as const;
export type TitleCode = (typeof TITLE_CODES)[number];

export const TITLE_MIN_LEVEL: Record<TitleCode, number> = {
  newcomer: 1,
  diligent: 3,
  word_hunter: 6,
  vocab_ace: 10,
  scholar: 15,
  ielts_master: 22,
  legend: 30,
};

export function unlockedTitleCodes(level: number): TitleCode[] {
  return TITLE_CODES.filter((c) => TITLE_MIN_LEVEL[c] <= level);
}

export function highestTitleCode(level: number): TitleCode {
  const unlocked = unlockedTitleCodes(level);
  return unlocked[unlocked.length - 1] ?? "newcomer";
}

export function isTitleCode(value: string): value is TitleCode {
  return (TITLE_CODES as readonly string[]).includes(value);
}

// ── Badges ──────────────────────────────────────────────────────────────────

export const BADGE_CODES = [
  "first_assignment",
  "perfect_score",
  "speedrunner",
  "streak_7",
  "streak_30",
  "game_podium",
  "game_champion",
  "words_100",
  "night_owl",
  "level_10",
  "level_25",
] as const;
export type BadgeCode = (typeof BADGE_CODES)[number];

export function isBadgeCode(value: string): value is BadgeCode {
  return (BADGE_CODES as readonly string[]).includes(value);
}
