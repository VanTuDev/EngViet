"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { App } from "antd";
import {
  ArrowLeftOutlined,
  BulbOutlined,
  CheckCircleOutlined,
  FireOutlined,
  SoundOutlined,
  TrophyOutlined,
} from "@/components/icons";
import { Confetti } from "@/components/motion/confetti";
import { FlipCard } from "@/components/features/srs/flip-card";
import { Link, useRouter } from "@/i18n/navigation";
import { gradeSrsCard } from "@/lib/actions";
import { cn } from "@/lib/utils";
import { formatIntervalShort, previewIntervalDays, speakWord, splitExampleAroundWord } from "@/lib/srs";
import type { SrsCard, SrsGrade, SrsReviewQueue, SrsStreak } from "@/lib/types";

const GRADES: { grade: SrsGrade; tone: string }[] = [
  { grade: "again", tone: "bg-error text-on-error" },
  { grade: "hard", tone: "bg-tertiary text-on-tertiary" },
  { grade: "good", tone: "bg-primary text-on-primary" },
  { grade: "easy", tone: "bg-secondary text-on-secondary" },
];

export function ReviewSession({ initial }: { initial: SrsReviewQueue }) {
  const t = useTranslations("dash.srs");
  const { message } = App.useApp();
  const router = useRouter();

  const [queue, setQueue] = useState<SrsCard[]>(initial.cards);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [grading, setGrading] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [streak, setStreak] = useState<SrsStreak>(initial.streak);

  const card = queue[index];
  const finished = index >= queue.length;
  const total = queue.length;
  const progress = total > 0 ? Math.round((index / total) * 100) : 100;

  const intervalLabels = useMemo(() => {
    if (!card) return {} as Record<SrsGrade, string>;
    return GRADES.reduce(
      (acc, { grade }) => {
        acc[grade] = formatIntervalShort(previewIntervalDays(card, grade), (key, values) => t(key, values));
        return acc;
      },
      {} as Record<SrsGrade, string>,
    );
  }, [card, t]);

  const handleGrade = useCallback(
    async (grade: SrsGrade) => {
      if (!card || grading) return;
      setGrading(true);
      const res = await gradeSrsCard(card.id, grade);
      setGrading(false);
      if (!res.ok) {
        void message.error(res.error);
        return;
      }
      setStreak(res.result.streak);
      setReviewedCount((n) => n + 1);
      // "Quên" → the card comes back before the session ends.
      if (grade === "again") setQueue((prev) => [...prev, card]);
      setFlipped(false);
      setIndex((i) => i + 1);
    },
    [card, grading, message],
  );

  if (initial.cards.length === 0) {
    return <AllCaughtUp streak={initial.streak} reviewedToday={initial.reviewedToday} nothingEver={initial.streak.longest === 0 && initial.reviewedToday === 0} />;
  }

  if (finished) {
    return <SessionComplete reviewedCount={reviewedCount} streak={streak} />;
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
      <div className="flex items-center justify-between">
        <Link
          href="/student/dashboard"
          className="flex items-center gap-1 font-label-md text-label-md text-on-surface-variant hover:text-primary"
        >
          <ArrowLeftOutlined /> {t("exit")}
        </Link>
        <span className="flex items-center gap-1.5 font-label-md text-label-md text-tertiary">
          <FireOutlined /> {t("streakDays", { count: streak.current })}
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-surface-container-low">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
      </div>
      <p className="text-center font-label-sm text-label-sm text-on-surface-variant">
        {t("cardProgress", { current: Math.min(index + 1, total), total })}
      </p>

      {card ? (
        <FlipCard
          flipped={flipped}
          onFlip={setFlipped}
          minHeight="19rem"
          ariaLabel={t("tapToReveal")}
          front={
            <>
              <div className="flex items-start justify-between">
                <div className="flex flex-wrap gap-1.5">
                  {card.isNew ? (
                    <span className="rounded-full bg-primary/15 px-2 py-0.5 font-label-sm text-[11px] text-primary">
                      {t("badgeNew")}
                    </span>
                  ) : null}
                  {card.fromMistake ? (
                    <span className="rounded-full bg-error/15 px-2 py-0.5 font-label-sm text-[11px] text-error">
                      {t("badgeMistake")}
                    </span>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    speakWord(card.word);
                  }}
                  aria-label={t("listen")}
                  className="rounded-full p-1.5 text-xl text-on-surface-variant transition-colors hover:bg-surface-variant hover:text-primary"
                >
                  <SoundOutlined />
                </button>
              </div>
              <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
                <h2 className="font-heading text-headline-lg text-on-surface">{card.word}</h2>
                {card.ipa ? <p className="font-body-md text-body-md text-on-surface-variant">{card.ipa}</p> : null}
                <p className="mt-4 flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant/70">
                  <BulbOutlined /> {t("tapToReveal")}
                </p>
              </div>
            </>
          }
          back={
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
              <h2 className="font-heading text-headline-md text-on-surface/70">{card.word}</h2>
              <p className="font-heading text-headline-sm text-primary">{card.meaning}</p>
              {card.example ? (
                <p className="text-body-sm text-on-surface-variant">
                  {splitExampleAroundWord(card.example, card.word).map((seg, i) => (
                    <span key={i} className={seg.match ? "font-semibold text-on-surface" : undefined}>
                      {seg.text}
                    </span>
                  ))}
                </p>
              ) : null}
            </div>
          }
        />
      ) : null}

      {flipped && card ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {GRADES.map(({ grade, tone }) => (
            <button
              key={grade}
              type="button"
              disabled={grading}
              onClick={() => void handleGrade(grade)}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-xl px-2 py-3 font-label-md text-label-md transition-all active:scale-[0.97] disabled:opacity-50",
                tone,
              )}
            >
              <span>{t(`grade_${grade}`)}</span>
              <span className="font-label-sm text-[11px] opacity-80">{intervalLabels[grade]}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SessionComplete({ reviewedCount, streak }: { reviewedCount: number; streak: SrsStreak }) {
  const t = useTranslations("dash.srs");
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 rounded-2xl border border-outline-variant bg-surface-container-lowest p-8 text-center">
      {reviewedCount > 0 ? <Confetti seedKey="srs-done" /> : null}
      <CheckCircleOutlined className="text-5xl text-secondary" />
      <h2 className="font-heading text-headline-lg text-on-surface">{t("doneTitle")}</h2>
      <p className="text-body-md text-on-surface-variant">{t("doneBody", { count: reviewedCount })}</p>
      <p className="flex items-center gap-1.5 font-heading text-headline-sm text-tertiary">
        <FireOutlined /> {t("streakDays", { count: streak.current })}
      </p>
      <Link
        href="/student/dashboard"
        className="mt-2 rounded-lg bg-primary px-5 py-2.5 font-label-md text-label-md text-on-primary transition-colors hover:bg-primary/90"
      >
        {t("backToDashboard")}
      </Link>
    </div>
  );
}

function AllCaughtUp({
  streak,
  reviewedToday,
  nothingEver,
}: {
  streak: SrsStreak;
  reviewedToday: number;
  nothingEver: boolean;
}) {
  const t = useTranslations("dash.srs");
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 rounded-2xl border border-outline-variant bg-surface-container-lowest p-8 text-center">
      <TrophyOutlined className="text-5xl text-tertiary" />
      <h2 className="font-heading text-headline-lg text-on-surface">
        {nothingEver ? t("emptyTitle") : t("caughtUpTitle")}
      </h2>
      <p className="text-body-md text-on-surface-variant">
        {nothingEver ? t("emptyBody") : t("caughtUpBody", { count: reviewedToday })}
      </p>
      {!nothingEver ? (
        <p className="flex items-center gap-1.5 font-heading text-headline-sm text-tertiary">
          <FireOutlined /> {t("streakDays", { count: streak.current })}
        </p>
      ) : null}
      <Link
        href={nothingEver ? "/student/classes" : "/student/dashboard"}
        className="mt-2 rounded-lg bg-primary px-5 py-2.5 font-label-md text-label-md text-on-primary transition-colors hover:bg-primary/90"
      >
        {nothingEver ? t("emptyCta") : t("backToDashboard")}
      </Link>
    </div>
  );
}
