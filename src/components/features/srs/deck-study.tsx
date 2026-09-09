"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Button } from "antd";
import { ArrowLeftOutlined, ArrowRightOutlined, ReloadOutlined, SoundOutlined, SwapOutlined } from "@/components/icons";
import { FlipCard } from "@/components/features/srs/flip-card";
import { speakWord, splitExampleAroundWord } from "@/lib/srs";
import { cn } from "@/lib/utils";
import type { DeckEntry } from "@/lib/types";

/** Seeded-free shuffle is fine here — this is a transient client-only view, not render output. */
function shuffled<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/**
 * "Xem nhanh" — browse a deck as flashcards with a 3D flip, no grading. Prev/Next/Shuffle,
 * keyboard arrows, Space to flip. For learning a set quickly before the real SM-2 review.
 */
export function DeckStudy({ entries, emptyHint }: { entries: DeckEntry[]; emptyHint?: string }) {
  const t = useTranslations("dash.decks.study");
  const [order, setOrder] = React.useState<DeckEntry[]>(entries);
  const [index, setIndex] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);
  const [isShuffled, setIsShuffled] = React.useState(false);

  const total = order.length;
  const card = order[index];

  const go = React.useCallback(
    (delta: number) => {
      setFlipped(false);
      setIndex((i) => Math.min(Math.max(i + delta, 0), Math.max(total - 1, 0)));
    },
    [total],
  );

  const reshuffle = () => {
    setOrder((prev) => (isShuffled ? entries : shuffled(prev)));
    setIsShuffled((s) => !s);
    setIndex(0);
    setFlipped(false);
  };

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  if (total === 0) {
    return <p className="rounded-xl border border-dashed border-outline-variant p-6 text-center text-body-sm text-on-surface-variant">{emptyHint ?? t("empty")}</p>;
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="font-label-sm text-label-sm text-on-surface-variant">
          {t("progress", { current: index + 1, total })}
        </span>
        <button
          type="button"
          onClick={reshuffle}
          className={cn(
            "flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-label-sm text-label-sm transition-colors",
            isShuffled
              ? "border-primary/50 bg-primary-container/20 text-primary"
              : "border-outline-variant text-on-surface-variant hover:bg-surface-variant",
          )}
        >
          <SwapOutlined /> {t("shuffle")}
        </button>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-surface-container-low">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${((index + 1) / total) * 100}%` }} />
      </div>

      {card ? (
        <FlipCard
          flipped={flipped}
          onFlip={setFlipped}
          ariaLabel={t("flipHint")}
          front={
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
              <h2 className="font-heading text-headline-lg text-on-surface">{card.word}</h2>
              {card.ipa ? <p className="font-body-md text-body-md text-on-surface-variant">{card.ipa}</p> : null}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  speakWord(card.word);
                }}
                aria-label={t("listen")}
                className="mt-1 rounded-full p-1.5 text-xl text-on-surface-variant transition-colors hover:bg-surface-variant hover:text-primary"
              >
                <SoundOutlined />
              </button>
              <p className="mt-3 font-label-sm text-label-sm text-on-surface-variant/70">{t("tapToFlip")}</p>
            </div>
          }
          back={
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
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

      <div className="flex items-center justify-between gap-3">
        <Button size="large" icon={<ArrowLeftOutlined />} onClick={() => go(-1)} disabled={index === 0}>
          {t("prev")}
        </Button>
        <Button
          type="primary"
          size="large"
          onClick={() => go(1)}
          disabled={index >= total - 1}
        >
          {t("next")} <ArrowRightOutlined />
        </Button>
      </div>

      {index >= total - 1 ? (
        <button
          type="button"
          onClick={() => {
            setIndex(0);
            setFlipped(false);
          }}
          className="mx-auto flex items-center gap-1.5 font-label-md text-label-md text-primary hover:underline"
        >
          <ReloadOutlined /> {t("restart")}
        </button>
      ) : null}
    </div>
  );
}
