"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { App, Button, Card, Input, Typography } from "antd";
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, LoadingOutlined, TrophyOutlined } from "@/components/icons";
import { Confetti } from "@/components/motion/confetti";
import { LevelBadge } from "@/components/features/gamification/level-badge";
import { useGameSocket } from "@/hooks/use-game-socket";
import { cn } from "@/lib/utils";
import type { ApiUser, GameLeaderboardEntry, GameQuestionKind } from "@/lib/types";

interface QuestionPayload {
  questionIndex: number;
  totalQuestions: number;
  kind: GameQuestionKind;
  prompt: string;
  imageUrl?: string;
  timeLimitSeconds: number;
  questionEndsAt: string;
  options?: string[];
  scrambledLetters?: string[];
}
interface AnswerAck {
  kind: GameQuestionKind;
  pending: boolean;
  correct?: boolean;
  correctIndex?: number;
  pointsAwarded: number;
  totalScore: number;
}
interface YourResult {
  questionIndex: number;
  correct: boolean;
  pointsAwarded: number;
  totalScore: number;
}
interface RevealPayload {
  questionIndex: number;
  kind: GameQuestionKind;
  correctIndex?: number;
  optionCounts?: number[];
  correctAnswer?: string;
  answerBreakdown?: { answer: string; count: number; correct: boolean }[];
  leaderboard: GameLeaderboardEntry[];
}
interface FinishedPayload {
  leaderboard: GameLeaderboardEntry[];
  topCount: number;
}
interface JoinAckData {
  status: "lobby" | "question" | "reveal" | "finished";
  you: { studentId: string; score: number };
}

type Phase = "connecting" | "lobby" | "question" | "reveal" | "finished";

const OPTION_COLORS = ["bg-primary", "bg-secondary", "bg-tertiary", "bg-error"];

function useCountdown(endsAt: string | undefined): number {
  const [secondsLeft, setSecondsLeft] = useState(0);
  useEffect(() => {
    if (!endsAt) return;
    const target = new Date(endsAt).getTime();
    const tick = () => setSecondsLeft(Math.max(0, Math.round((target - Date.now()) / 1000)));
    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [endsAt]);
  return secondsLeft;
}

export function GamePlay({ pin, title, user }: { pin: string; title: string; user: ApiUser }) {
  const t = useTranslations("dash.games.play");
  const { message } = App.useApp();
  const { socket, connected, emit } = useGameSocket();
  const [phase, setPhase] = useState<Phase>("connecting");
  const [question, setQuestion] = useState<QuestionPayload | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [textAnswer, setTextAnswer] = useState("");
  const [picked, setPicked] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<AnswerAck | null>(null);
  const [yourResult, setYourResult] = useState<YourResult | null>(null);
  const [reveal, setReveal] = useState<RevealPayload | null>(null);
  const [finished, setFinished] = useState<FinishedPayload | null>(null);
  const secondsLeft = useCountdown(question?.questionEndsAt);

  useEffect(() => {
    if (!connected || !socket) return;
    let cancelled = false;
    void emit<JoinAckData>("join", { pin }).then((ack) => {
      if (cancelled) return;
      if (!ack.ok) {
        void message.error(ack.error);
        return;
      }
      setPhase(ack.data.status);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- join once per connection
  }, [connected, socket, pin]);

  useEffect(() => {
    if (!socket) return;
    const onQuestion = (payload: QuestionPayload) => {
      setQuestion(payload);
      setSelected(null);
      setTextAnswer("");
      setPicked([]);
      setSubmitted(false);
      setResult(null);
      setYourResult(null);
      setReveal(null);
      setPhase("question");
    };
    const onYourResult = (payload: YourResult) => setYourResult(payload);
    const onReveal = (payload: RevealPayload) => {
      setReveal(payload);
      setPhase("reveal");
    };
    const onFinished = (payload: FinishedPayload) => {
      setFinished(payload);
      setPhase("finished");
    };
    socket.on("question", onQuestion);
    socket.on("your-result", onYourResult);
    socket.on("reveal", onReveal);
    socket.on("finished", onFinished);
    return () => {
      socket.off("question", onQuestion);
      socket.off("your-result", onYourResult);
      socket.off("reveal", onReveal);
      socket.off("finished", onFinished);
    };
  }, [socket]);

  async function submitAnswer(answer: number | string) {
    if (!question || submitted || submitting) return;
    setSubmitting(true);
    const ack = await emit<AnswerAck>("answer", { pin, questionIndex: question.questionIndex, answer });
    setSubmitting(false);
    if (ack.ok) {
      setSubmitted(true);
      setResult(ack.data);
    } else {
      void message.error(ack.error);
    }
  }

  if (phase === "connecting") {
    return (
      <Card className="flex items-center justify-center p-12">
        <LoadingOutlined spin className="text-2xl" />
      </Card>
    );
  }

  if (phase === "lobby") {
    return (
      <Card className="flex flex-col items-center gap-3 p-10 text-center">
        <LoadingOutlined spin className="text-3xl text-primary" />
        <h2 className="font-heading text-headline-md text-on-surface">{t("waitingTitle", { title })}</h2>
        <p className="text-body-sm text-on-surface-variant">{t("waitingDesc")}</p>
      </Card>
    );
  }

  if (phase === "question" && question) {
    const timeUp = secondsLeft === 0;
    const scrambleWord = picked.map((i) => question.scrambledLetters?.[i] ?? "").join("");
    const scrambleComplete = (question.scrambledLetters?.length ?? 0) > 0 && picked.length === question.scrambledLetters?.length;

    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="font-label-sm text-label-sm text-on-surface-variant">
            {t("questionProgress", { current: question.questionIndex + 1, total: question.totalQuestions })}
          </p>
          <p className={cn("font-heading text-headline-md tabular-nums", secondsLeft <= 5 && "text-error")}>{secondsLeft}s</p>
        </div>

        <Card>
          <h2 className="font-heading text-headline-md text-on-surface">{question.prompt}</h2>
          {question.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- remote Cloudinary URL
            <img src={question.imageUrl} alt="" className="mx-auto mt-3 max-h-56 rounded-lg object-contain" />
          ) : null}
        </Card>

        {question.kind === "multiple_choice" ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {(question.options ?? []).map((option, index) => {
              const isSelected = selected === index;
              return (
                <button
                  key={index}
                  type="button"
                  disabled={submitted || timeUp}
                  onClick={() => {
                    setSelected(index);
                    void submitAnswer(index);
                  }}
                  className={cn(
                    "flex min-h-[4.5rem] items-center gap-3 rounded-xl p-4 text-left font-label-lg text-label-lg text-on-primary transition-all",
                    OPTION_COLORS[index],
                    isSelected ? "ring-4 ring-on-surface/40" : submitted ? "opacity-40" : "active:scale-[0.98]",
                  )}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/25 font-bold">{"ABCD"[index]}</span>
                  <span>{option}</span>
                </button>
              );
            })}
          </div>
        ) : null}

        {question.kind === "fill_blank" ? (
          <Card className="flex flex-col gap-3">
            <label className="font-label-sm text-label-sm text-on-surface-variant">{t("fillBlankLabel")}</label>
            <Input
              size="large"
              autoFocus
              placeholder={t("fillBlankPlaceholder")}
              value={textAnswer}
              disabled={submitted || timeUp}
              onChange={(e) => setTextAnswer(e.target.value)}
              onPressEnter={() => {
                if (textAnswer.trim().length > 0) void submitAnswer(textAnswer.trim());
              }}
            />
            <Button
              type="primary"
              block
              size="large"
              loading={submitting}
              disabled={submitted || timeUp || textAnswer.trim().length === 0}
              onClick={() => void submitAnswer(textAnswer.trim())}
            >
              {t("submitAnswer")}
            </Button>
          </Card>
        ) : null}

        {question.kind === "scramble" ? (
          <Card className="flex flex-col gap-4">
            <label className="font-label-sm text-label-sm text-on-surface-variant">{t("scrambleLabel")}</label>

            <div className="flex min-h-[3.5rem] flex-wrap items-center gap-2 rounded-lg border border-dashed border-outline-variant p-3">
              {picked.length === 0 ? (
                <span className="font-label-sm text-label-sm text-on-surface-variant/60">{t("scrambleTapHint")}</span>
              ) : (
                picked.map((letterIndex, slot) => (
                  <button
                    key={slot}
                    type="button"
                    disabled={submitted || timeUp}
                    onClick={() => setPicked((prev) => prev.filter((_, i) => i !== slot))}
                    className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary font-heading text-headline-sm uppercase text-on-primary disabled:opacity-50"
                  >
                    {question.scrambledLetters?.[letterIndex]}
                  </button>
                ))
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {(question.scrambledLetters ?? []).map((letter, letterIndex) => {
                const used = picked.includes(letterIndex);
                return (
                  <button
                    key={letterIndex}
                    type="button"
                    disabled={used || submitted || timeUp}
                    onClick={() => setPicked((prev) => [...prev, letterIndex])}
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-lg border font-heading text-headline-sm uppercase transition-all",
                      used
                        ? "border-outline-variant bg-surface-container-low text-on-surface-variant/30"
                        : "border-primary/40 bg-surface text-on-surface active:scale-95",
                    )}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-2">
              <Button
                type="primary"
                block
                size="large"
                loading={submitting}
                disabled={submitted || timeUp || !scrambleComplete}
                onClick={() => void submitAnswer(scrambleWord)}
              >
                {t("submitAnswer")}
              </Button>
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  disabled={submitted || timeUp || picked.length === 0}
                  onClick={() => setPicked((prev) => prev.slice(0, -1))}
                >
                  {t("scrambleBackspace")}
                </Button>
                <Button
                  className="flex-1"
                  disabled={submitted || timeUp || picked.length === 0}
                  onClick={() => setPicked([])}
                >
                  {t("scrambleClear")}
                </Button>
              </div>
            </div>
          </Card>
        ) : null}

        {submitted ? (
          <p className="text-center font-label-md text-label-md text-on-surface-variant">
            {result?.pending ? t("pendingJudgment") : submitting ? t("submitting") : t("answerLocked")}
          </p>
        ) : null}
      </div>
    );
  }

  if (phase === "reveal" && reveal) {
    const myRank = reveal.leaderboard.find((entry) => entry.studentId === user.id);
    const outcome: { correct: boolean; points: number } | null = yourResult
      ? { correct: yourResult.correct, points: yourResult.pointsAwarded }
      : result && !result.pending && result.correct !== undefined
        ? { correct: result.correct, points: result.pointsAwarded }
        : null;
    const correctAnswerLabel =
      reveal.kind === "multiple_choice"
        ? t("correctWas", { letter: "ABCD"[reveal.correctIndex ?? 0] ?? "" })
        : t("correctAnswerWas", { answer: reveal.correctAnswer ?? "" });

    return (
      <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
        <Card className="flex flex-col items-center gap-2 p-8 text-center">
          {outcome ? (
            outcome.correct ? (
              <>
                <CheckCircleOutlined className="text-4xl text-secondary" />
                <p className="font-heading text-headline-md text-on-surface">{t("correct")}</p>
                <p className="font-heading text-headline-lg tabular-nums text-primary">+{outcome.points}</p>
              </>
            ) : (
              <>
                <CloseCircleOutlined className="text-4xl text-error" />
                <p className="font-heading text-headline-md text-on-surface">{t("wrong")}</p>
                <p className="text-body-sm text-on-surface-variant">{correctAnswerLabel}</p>
              </>
            )
          ) : submitted ? (
            <>
              <ClockCircleOutlined className="text-4xl text-on-surface-variant" />
              <p className="font-heading text-headline-md text-on-surface">{t("pendingJudgment")}</p>
            </>
          ) : (
            <>
              <CloseCircleOutlined className="text-4xl text-on-surface-variant" />
              <p className="font-heading text-headline-md text-on-surface">{t("noAnswer")}</p>
              <p className="text-body-sm text-on-surface-variant">{correctAnswerLabel}</p>
            </>
          )}
          {myRank ? (
            <p className="mt-2 font-label-md text-label-md text-on-surface-variant">
              {t("yourRank", { rank: myRank.rank, score: myRank.score })}
            </p>
          ) : null}
        </Card>

        <Card>
          <h3 className="mb-2 font-heading text-headline-sm text-on-surface">{t("leaderboard")}</h3>
          <ol className="flex flex-col gap-1.5">
            {reveal.leaderboard.slice(0, 5).map((entry) => (
              <li
                key={entry.studentId}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2",
                  entry.studentId === user.id ? "bg-primary-container/20" : "bg-surface-container-lowest",
                )}
              >
                <span className="flex min-w-0 items-center gap-1.5 font-label-md text-label-md text-on-surface">
                  <span className="shrink-0">#{entry.rank}</span>
                  <span className="truncate">{entry.studentName}</span>
                  {entry.level ? <LevelBadge level={entry.level} title={entry.title} size="sm" /> : null}
                </span>
                <span className="font-heading text-headline-sm tabular-nums text-primary">{entry.score}</span>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    );
  }

  if (phase === "finished" && finished) {
    const myEntry = finished.leaderboard.find((entry) => entry.studentId === user.id);
    const madeTop = Boolean(myEntry && myEntry.rank <= finished.topCount);
    const podium = finished.leaderboard.slice(0, finished.topCount);
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
        {madeTop ? <Confetti seedKey={`game-${pin}`} /> : null}
        <Card className="flex flex-col items-center gap-2 p-8 text-center">
          <TrophyOutlined className={cn("text-5xl", madeTop ? "text-tertiary" : "text-outline")} />
          <h2 className="font-heading text-headline-lg text-on-surface">{t("gameOver")}</h2>
          {myEntry ? (
            <p className="font-heading text-headline-md tabular-nums text-primary">
              {t("finalRank", { rank: myEntry.rank, score: myEntry.score })}
            </p>
          ) : null}
        </Card>

        <Card>
          <h3 className="mb-2 flex items-center gap-2 font-heading text-headline-sm text-on-surface">
            <TrophyOutlined /> {t("podium", { count: finished.topCount })}
          </h3>
          <ol className="flex flex-col gap-1.5">
            {podium.map((entry) => (
              <li
                key={entry.studentId}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2",
                  entry.studentId === user.id ? "bg-primary-container/20" : "bg-surface-container-lowest",
                )}
              >
                <span className="flex min-w-0 items-center gap-1.5 font-label-md text-label-md text-on-surface">
                  <span className="shrink-0">#{entry.rank}</span>
                  <span className="truncate">{entry.studentName}</span>
                  {entry.level ? <LevelBadge level={entry.level} title={entry.title} size="sm" /> : null}
                </span>
                <span className="font-heading text-headline-sm tabular-nums text-primary">{entry.score}</span>
              </li>
            ))}
          </ol>
          {finished.leaderboard.length > finished.topCount ? (
            <Typography.Text type="secondary" className="mt-3 block">
              {t("moreStudents", { count: finished.leaderboard.length - finished.topCount })}
            </Typography.Text>
          ) : null}
        </Card>
      </div>
    );
  }

  return null;
}
