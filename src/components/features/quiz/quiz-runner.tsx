"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeftOutlined, ArrowRightOutlined, CheckCircleOutlined, TrophyOutlined, CloseCircleOutlined } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Confetti } from "@/components/motion/confetti";
import { TimerRing } from "@/components/motion/timer-ring";
import { XpRewardBanner } from "@/components/features/gamification/xp-reward-banner";
import { Link } from "@/i18n/navigation";
import { useCountdown } from "@/hooks/use-countdown";
import { useCountUp } from "@/hooks/use-count-up";
import { submitQuiz } from "@/lib/actions";
import { cn, formatDuration, haptic } from "@/lib/utils";
import type { AttemptResult, QuizOption, QuizQuestion } from "@/lib/types";

export interface QuizRunnerProps {
  assignmentId: string;
  assignmentTitle: string;
  classHref: string;
  leaderboardHref: string;
  questions: QuizQuestion[];
  durationSeconds: number;
}

type AnswerMap = Record<string, QuizOption["key"] | null>;

export function QuizRunner({
  assignmentId,
  assignmentTitle,
  classHref,
  leaderboardHref,
  questions,
  durationSeconds,
}: QuizRunnerProps) {
  const t = useTranslations("dash.quiz");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [phase, setPhase] = useState<"playing" | "submitting" | "done">("playing");
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const startedAt = useState(() => Date.now())[0];
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const { secondsLeft } = useCountdown(durationSeconds, {
    onExpire: () => void handleSubmit(),
  });

  const submitted = phase !== "playing";
  const currentQuestion = questions[index];
  const answeredCount = Object.values(answers).filter(Boolean).length;
  const isLast = index === questions.length - 1;

  function selectAnswer(questionId: string, key: QuizOption["key"]) {
    setAnswers((prev) => ({ ...prev, [questionId]: key }));
    haptic(8);
  }

  async function handleSubmit() {
    if (phase !== "playing") return;
    const secs = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
    setElapsedSeconds(secs);
    setPhase("submitting");
    setError(null);
    haptic(28);
    const res = await submitQuiz(assignmentId, {
      answers: questions.map((q, i) => ({ questionIndex: i, selectedKey: answers[q.id] ?? null })),
      timeTakenSeconds: secs,
    });
    if (res.ok) {
      setResult(res.result);
      setPhase("done");
    } else {
      setError(res.error);
      setPhase("playing");
    }
  }

  // Phím tắt: A–D / 1–4 chọn đáp án, ← → chuyển câu.
  useEffect(() => {
    if (submitted) return;
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) return;

      const q = questions[index];
      if (!q) return;
      const key = e.key.toLowerCase();
      const letterPos = "abcd".indexOf(key);
      const numPos = "1234".indexOf(key);
      const pos = letterPos >= 0 ? letterPos : numPos;

      if (pos >= 0 && q.options[pos]) {
        e.preventDefault();
        selectAnswer(q.id, q.options[pos]!.key);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setIndex((i) => Math.max(0, i - 1));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setIndex((i) => Math.min(questions.length - 1, i + 1));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, questions, submitted]);

  if (phase === "done" && result) {
    return (
      <QuizResult
        title={assignmentTitle}
        result={result}
        elapsedSeconds={elapsedSeconds}
        classHref={classHref}
        leaderboardHref={leaderboardHref}
      />
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      {/* Đầu trang: tiến độ + đồng hồ vòng */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-label-sm text-label-sm text-on-surface-variant">
            {t("questionProgress", { current: index + 1, total: questions.length })}
          </p>
          <h1 className="truncate font-heading text-headline-md text-on-surface">{assignmentTitle}</h1>
        </div>
        <div className="shrink-0">
          <TimerRing secondsLeft={secondsLeft} totalSeconds={durationSeconds} label={formatDuration(secondsLeft)} size={60} />
        </div>
      </div>

      {/* Dải chỉ số câu hỏi — cuộn ngang trên mobile */}
      <div className="scrollbar-thin -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {questions.map((q, i) => {
          const answered = Boolean(answers[q.id]);
          const isCurrent = i === index;
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={t("questionAria", { index: i + 1 })}
              aria-current={isCurrent ? "true" : undefined}
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border font-label-sm text-label-sm transition-colors",
                isCurrent
                  ? "border-2 border-primary bg-primary text-on-primary"
                  : answered
                    ? "border-secondary bg-secondary-container text-on-secondary-container"
                    : "border-outline-variant bg-surface text-on-surface-variant",
              )}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      <Card className="p-5 sm:p-6">
        <p className="mb-5 font-body-lg text-body-lg text-on-surface">{currentQuestion.prompt}</p>
        <div className="flex flex-col gap-3" role="radiogroup" aria-label={t("questionAria", { index: index + 1 })}>
          {currentQuestion.options.map((option) => {
            const selected = answers[currentQuestion.id] === option.key;
            return (
              <label key={option.key} className="group relative cursor-pointer">
                <input
                  type="radio"
                  name={`answer-${currentQuestion.id}`}
                  className="peer sr-only"
                  checked={selected}
                  onChange={() => selectAnswer(currentQuestion.id, option.key)}
                />
                <div
                  className={cn(
                    "flex min-h-[3.25rem] w-full items-center rounded-xl border p-3 transition-all duration-200 sm:p-4",
                    selected
                      ? "border-primary bg-primary-container/10 ring-2 ring-primary/50"
                      : "border-outline-variant bg-surface active:bg-surface-container-low hover:border-outline hover:bg-surface-container-low",
                  )}
                >
                  <div
                    className={cn(
                      "mr-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 font-heading text-headline-sm transition-colors sm:h-10 sm:w-10",
                      selected ? "border-primary bg-primary text-on-primary" : "border-outline-variant text-outline-variant",
                    )}
                  >
                    {option.key}
                  </div>
                  <span className="font-body-md text-body-md text-on-surface">{option.text}</span>
                </div>
              </label>
            );
          })}
        </div>

        <p className="mt-4 hidden text-center font-label-sm text-label-sm text-on-surface-variant sm:block">
          {t("keyboardHint")}
        </p>
      </Card>

      {/* Thanh điều hướng — 1 hàng trên desktop, xếp gọn trên mobile */}
      <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
        >
          <ArrowLeftOutlined /> {t("previous")}
        </Button>

        <div className="contents sm:flex sm:gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))}
            disabled={isLast}
          >
            {t("nextQuestion")} <ArrowRightOutlined />
          </Button>

          <Button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={phase === "submitting"}
            className="col-span-2"
          >
            {t("submit")} <CheckCircleOutlined />
          </Button>
        </div>
      </div>

      {error ? <p className="text-center font-label-sm text-label-sm text-error">{error}</p> : null}

      <p className="text-center font-label-sm text-label-sm text-on-surface-variant">
        {t("answeredProgress", { answered: answeredCount, total: questions.length })}
      </p>
    </div>
  );
}

function QuizResult({
  title,
  result,
  elapsedSeconds,
  classHref,
  leaderboardHref,
}: {
  title: string;
  result: AttemptResult;
  elapsedSeconds: number;
  classHref: string;
  leaderboardHref: string;
}) {
  const t = useTranslations("dash.quiz");
  const shownScore = useCountUp(result.score);
  const passed = result.score >= 50;
  const review = result.review ?? [];

  return (
    <div className="mx-auto flex w-full max-w-focus flex-col gap-gutter">
      {passed ? <Confetti seedKey={`quiz-${title}`} /> : null}

      <Card className="flex flex-col items-center gap-2 p-8 text-center motion-safe:[animation:pop-in_0.4s_ease-out]">
        <TrophyOutlined className={cn("text-4xl", passed ? "text-tertiary" : "text-outline")} />
        <p className="font-label-md text-label-md text-on-surface-variant">{t("resultTitle", { title })}</p>
        <p className="font-heading text-headline-xl text-on-surface tabular-nums">{t("scorePoints", { score: shownScore })}</p>
        <p className="text-body-sm text-on-surface-variant">
          {t("resultSummary", {
            correct: result.correctCount,
            total: result.totalCount,
            time: formatDuration(result.timeTakenSeconds || elapsedSeconds),
          })}
        </p>
        {result.xp ? <XpRewardBanner reward={result.xp} seedKey={`quiz-${title}`} /> : null}

        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Button asChild variant="secondary">
            <Link href={classHref}>{t("backToClass")}</Link>
          </Button>
          <Button asChild>
            <Link href={leaderboardHref}>{t("viewLeaderboard")}</Link>
          </Button>
        </div>
      </Card>

      {review.length > 0 ? (
      <Card className="p-5 sm:p-6">
        <h3 className="mb-4 font-heading text-headline-sm text-on-surface">{t("explanations")}</h3>
        <ol className="flex flex-col gap-4">
          {review.map((q, i) => {
            const isCorrect = q.isCorrect;
            return (
              <li key={i} className="rounded-lg border border-outline-variant/50 p-4">
                <div className="mb-2 flex items-start gap-2">
                  {isCorrect ? (
                    <CheckCircleOutlined className="mt-0.5 shrink-0 text-xl text-secondary" />
                  ) : (
                    <CloseCircleOutlined className="mt-0.5 shrink-0 text-xl text-error" />
                  )}
                  <p className="font-label-md text-label-md text-on-surface">
                    {t("questionLabel", { index: i + 1, prompt: q.prompt })}
                  </p>
                </div>
                <div className="ml-7 flex flex-col gap-1">
                  {q.options.map((opt) => {
                    const isSelected = q.selectedKey === opt.key;
                    const isAnswer = q.correctKey === opt.key;
                    return (
                      <div
                        key={opt.key}
                        className={cn(
                          "flex items-center gap-2 rounded px-2 py-1 font-body-sm text-body-sm",
                          isAnswer && "bg-secondary-container/30 text-on-secondary-container",
                          isSelected && !isAnswer && "bg-error-container/30 text-on-error-container",
                        )}
                      >
                        {isAnswer ? (
                          <CheckCircleOutlined className="text-sm" />
                        ) : (
                          <span className="inline-block h-3 w-3 rounded-full border border-current opacity-40" aria-hidden="true" />
                        )}
                        <span className="font-semibold">{opt.key}.</span> {opt.text}
                        {isSelected && !isAnswer ? <span className="ml-auto text-label-sm">{t("youPicked")}</span> : null}
                      </div>
                    );
                  })}
                </div>
              </li>
            );
          })}
        </ol>
      </Card>
      ) : null}
    </div>
  );
}
