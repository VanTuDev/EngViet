"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircleOutlined, SmileOutlined, ReloadOutlined, ThunderboltOutlined } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Confetti } from "@/components/motion/confetti";
import { TimerRing } from "@/components/motion/timer-ring";
import { Link } from "@/i18n/navigation";
import { useCountdown } from "@/hooks/use-countdown";
import { useCountUp } from "@/hooks/use-count-up";
import { generateMatchingBoard, type MatchingCard } from "@/lib/generators";
import { submitMatching } from "@/lib/actions";
import { cn, formatDuration, haptic } from "@/lib/utils";
import type { VocabularyItem } from "@/lib/types";

export interface MatchingBoardProps {
  assignmentId: string;
  assignmentTitle: string;
  classHref: string;
  leaderboardHref: string;
  vocabulary: VocabularyItem[];
  durationSeconds: number;
  pairCount?: number;
}

type CardState = "idle" | "selected" | "matched" | "wrong";

export function MatchingBoard({
  assignmentId,
  assignmentTitle,
  classHref,
  leaderboardHref,
  vocabulary,
  durationSeconds,
  pairCount = 8,
}: MatchingBoardProps) {
  const t = useTranslations("dash.matching");
  // Xáo trộn seed theo tiêu đề (không phải Date.now()) — hàm thuần theo props.
  const board = useMemo(
    () => generateMatchingBoard(vocabulary, { seedKey: assignmentTitle, pairCount }),
    [vocabulary, assignmentTitle, pairCount],
  );
  const totalPairs = board.words.length;

  const [selected, setSelected] = useState<MatchingCard | null>(null);
  const [matchedPairIds, setMatchedPairIds] = useState<Set<string>>(new Set());
  const [wrongPairIds, setWrongPairIds] = useState<Set<string>>(new Set());
  const [mistakes, setMistakes] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [finished, setFinished] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [serverScore, setServerScore] = useState<number | null>(null);
  const startedAt = useState(() => Date.now())[0];

  const { secondsLeft } = useCountdown(durationSeconds, {
    onExpire: () => void finish(matchedPairIds.size),
  });

  async function finish(matchedNow: number) {
    if (finished) return;
    const secs = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
    setElapsedSeconds(secs);
    setFinished(true);
    haptic([20, 40, 20]);
    const res = await submitMatching(assignmentId, {
      matchedPairs: matchedNow,
      totalPairs,
      mistakes,
      timeTakenSeconds: secs,
    });
    if (res.ok) setServerScore(res.result.score);
  }

  function handleCardClick(card: MatchingCard) {
    if (finished || matchedPairIds.has(card.pairId) || card.id === selected?.id) return;

    if (!selected || selected.side === card.side) {
      setSelected(card);
      return;
    }

    if (selected.pairId === card.pairId) {
      const nextMatched = new Set(matchedPairIds).add(card.pairId);
      const nextStreak = streak + 1;
      setMatchedPairIds(nextMatched);
      setSelected(null);
      setStreak(nextStreak);
      setBestStreak((b) => Math.max(b, nextStreak));
      haptic(10);
      if (nextMatched.size === totalPairs) void finish(nextMatched.size);
    } else {
      setMistakes((m) => m + 1);
      setStreak(0);
      setWrongPairIds(new Set([selected.pairId, card.pairId]));
      setTimeout(() => setWrongPairIds(new Set()), 500);
      setSelected(null);
      haptic([15, 30]);
    }
  }

  if (finished) {
    return <MatchingResult
      title={assignmentTitle}
      matched={matchedPairIds.size}
      totalPairs={totalPairs}
      elapsedSeconds={elapsedSeconds}
      mistakes={mistakes}
      bestStreak={bestStreak}
      score={serverScore}
      classHref={classHref}
      leaderboardHref={leaderboardHref}
    />;
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant">
            <ThunderboltOutlined /> {t("label")}
          </p>
          <h1 className="truncate font-heading text-headline-md text-on-surface">{assignmentTitle}</h1>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {streak >= 2 ? (
            <span
              key={streak}
              className="rounded-full bg-tertiary-container/70 px-2.5 py-1 font-heading text-[13px] font-bold text-on-tertiary-container motion-safe:[animation:pop-in_0.3s_ease-out]"
            >
              🔥 x{streak}
            </span>
          ) : null}
          <TimerRing secondsLeft={secondsLeft} totalSeconds={durationSeconds} label={String(secondsLeft)} size={56} />
        </div>
      </div>

      <Progress value={matchedPairIds.size} max={totalPairs} tone="success" />

      <div className="grid grid-cols-2 gap-3 sm:gap-6">
        <BoardColumn cards={board.words} selected={selected} matchedPairIds={matchedPairIds} wrongPairIds={wrongPairIds} onSelect={handleCardClick} />
        <BoardColumn cards={board.meanings} selected={selected} matchedPairIds={matchedPairIds} wrongPairIds={wrongPairIds} onSelect={handleCardClick} />
      </div>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => void finish(matchedPairIds.size)}
        className="mx-auto"
      >
        <ReloadOutlined /> {t("submitEarly")}
      </Button>
    </div>
  );
}

function MatchingResult({
  title,
  matched,
  totalPairs,
  elapsedSeconds,
  mistakes,
  bestStreak,
  score,
  classHref,
  leaderboardHref,
}: {
  title: string;
  matched: number;
  totalPairs: number;
  elapsedSeconds: number;
  mistakes: number;
  bestStreak: number;
  score: number | null;
  classHref: string;
  leaderboardHref: string;
}) {
  const t = useTranslations("dash.matching");
  const shownMatched = useCountUp(matched);
  const perfect = matched === totalPairs && mistakes === 0;
  const cleared = matched === totalPairs;

  return (
    <div className="mx-auto flex w-full max-w-focus flex-col gap-gutter">
      {cleared ? <Confetti seedKey={`match-${title}`} count={perfect ? 90 : 60} /> : null}
      <Card className="flex flex-col items-center gap-2 p-8 text-center motion-safe:[animation:pop-in_0.4s_ease-out]">
        <SmileOutlined className={cn("text-4xl", cleared ? "text-secondary" : "text-outline")} />
        <p className="font-label-md text-label-md text-on-surface-variant">{t("done", { title })}</p>
        <p className="font-heading text-headline-xl text-on-surface tabular-nums">
          {t("pairsProgress", { matched: shownMatched, total: totalPairs })}
        </p>
        <p className="text-body-sm text-on-surface-variant">
          {score !== null ? `${score} / 100 · ` : ""}
          {t("resultSummary", { time: formatDuration(elapsedSeconds), mistakes })}
          {bestStreak >= 3 ? ` · 🔥 x${bestStreak}` : ""}
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Button asChild variant="secondary">
            <Link href={classHref}>{t("backToClass")}</Link>
          </Button>
          <Button asChild>
            <Link href={leaderboardHref}>{t("viewLeaderboard")}</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}

function BoardColumn({
  cards,
  selected,
  matchedPairIds,
  wrongPairIds,
  onSelect,
}: {
  cards: MatchingCard[];
  selected: MatchingCard | null;
  matchedPairIds: Set<string>;
  wrongPairIds: Set<string>;
  onSelect: (card: MatchingCard) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {cards.map((card) => {
        const matched = matchedPairIds.has(card.pairId);
        const wrong = wrongPairIds.has(card.pairId);
        const isSelected = selected?.id === card.id;
        const state: CardState = matched ? "matched" : wrong ? "wrong" : isSelected ? "selected" : "idle";

        return (
          <button
            key={card.id}
            type="button"
            disabled={matched}
            aria-pressed={isSelected}
            onClick={() => onSelect(card)}
            className={cn(
              "min-h-[3.5rem] rounded-xl border p-3 text-left font-body-md text-body-md transition-all duration-200 active:scale-[0.98] sm:p-4",
              state === "matched" && "border-secondary bg-secondary-container/30 text-on-secondary-container opacity-60",
              state === "wrong" && "border-error bg-error-container/40 text-on-error-container motion-safe:animate-shake",
              state === "selected" && "border-primary bg-primary-container/15 text-primary ring-2 ring-primary/40",
              state === "idle" &&
                "border-outline-variant bg-surface-container-lowest text-on-surface hover:border-primary/40 hover:bg-surface-container-low",
            )}
          >
            <span className="flex items-center gap-2">
              {state === "matched" ? <CheckCircleOutlined className="shrink-0" /> : null}
              {card.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
