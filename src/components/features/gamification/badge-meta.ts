import {
  BookOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CrownOutlined,
  FileDoneOutlined,
  FireOutlined,
  RiseOutlined,
  RocketOutlined,
  StarOutlined,
  ThunderboltOutlined,
  TrophyOutlined,
} from "@/components/icons";
import type { IconType } from "@/lib/constants";
import { BADGE_CODES, type BadgeCode } from "@/lib/gamification";

/** Icon + accent colour for each achievement badge. Labels/descriptions come from `messages`. */
export const BADGE_META: Record<BadgeCode, { icon: IconType; tone: string }> = {
  first_assignment: { icon: FileDoneOutlined, tone: "text-primary bg-primary/10" },
  perfect_score: { icon: CheckCircleOutlined, tone: "text-secondary bg-secondary/10" },
  speedrunner: { icon: ThunderboltOutlined, tone: "text-tertiary bg-tertiary/10" },
  streak_7: { icon: FireOutlined, tone: "text-tertiary bg-tertiary/10" },
  streak_30: { icon: FireOutlined, tone: "text-error bg-error/10" },
  game_podium: { icon: TrophyOutlined, tone: "text-tertiary bg-tertiary/10" },
  game_champion: { icon: CrownOutlined, tone: "text-error bg-error/10" },
  words_100: { icon: BookOutlined, tone: "text-primary bg-primary/10" },
  night_owl: { icon: StarOutlined, tone: "text-primary bg-primary/10" },
  level_10: { icon: RiseOutlined, tone: "text-secondary bg-secondary/10" },
  level_25: { icon: RocketOutlined, tone: "text-error bg-error/10" },
};

/** Fallback for any code the backend adds before the frontend catches up. */
export const UNKNOWN_BADGE_META = { icon: ClockCircleOutlined, tone: "text-on-surface-variant bg-surface-variant" };

export const ALL_BADGE_CODES: readonly BadgeCode[] = BADGE_CODES;
