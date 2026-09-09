"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { App, Avatar, Button, Card, Progress, QRCode, Tag, Typography } from "antd";
import {
  ArrowRightOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  StopOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  TrophyOutlined,
} from "@/components/icons";
import { LevelBadge } from "@/components/features/gamification/level-badge";
import { useGameSocket } from "@/hooks/use-game-socket";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";
import type { GameLeaderboardEntry, GameQuestionKind } from "@/lib/types";

interface PlayerSummary {
  studentId: string;
  name: string;
  avatarUrl?: string;
  level?: number;
  title?: string;
  connected: boolean;
  score: number;
}
interface QuestionPayload {
  questionIndex: number;
  totalQuestions: number;
  kind: GameQuestionKind;
  prompt: string;
  imageUrl?: string;
  options?: string[];
  scrambledLetters?: string[];
  timeLimitSeconds: number;
  questionEndsAt: string;
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
  totalQuestions: number;
  players: PlayerSummary[];
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

export function HostRoom({ pin }: { pin: string }) {
  const t = useTranslations("dash.games.host");
  const { message } = App.useApp();
  const { socket, connected, emit } = useGameSocket();
  const [phase, setPhase] = useState<Phase>("connecting");
  const [players, setPlayers] = useState<PlayerSummary[]>([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [question, setQuestion] = useState<QuestionPayload | null>(null);
  const [reveal, setReveal] = useState<RevealPayload | null>(null);
  const [finished, setFinished] = useState<FinishedPayload | null>(null);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [busy, setBusy] = useState(false);
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
      setPlayers(ack.data.players);
      setTotalQuestions(ack.data.totalQuestions);
      setPhase(ack.data.status);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- join once per connection, not on every emit/message identity change
  }, [connected, socket, pin]);

  useEffect(() => {
    if (!socket) return;
    const onPlayerList = (payload: { players: PlayerSummary[] }) => setPlayers(payload.players);
    const onQuestion = (payload: QuestionPayload) => {
      setQuestion(payload);
      setReveal(null);
      setAnsweredCount(0);
      setPhase("question");
    };
    const onAnswerCount = (payload: { answered: number }) => setAnsweredCount(payload.answered);
    const onReveal = (payload: RevealPayload) => {
      setReveal(payload);
      setPhase("reveal");
    };
    const onFinished = (payload: FinishedPayload) => {
      setFinished(payload);
      setPhase("finished");
    };
    socket.on("player-list", onPlayerList);
    socket.on("question", onQuestion);
    socket.on("answer-count", onAnswerCount);
    socket.on("reveal", onReveal);
    socket.on("finished", onFinished);
    return () => {
      socket.off("player-list", onPlayerList);
      socket.off("question", onQuestion);
      socket.off("answer-count", onAnswerCount);
      socket.off("reveal", onReveal);
      socket.off("finished", onFinished);
    };
  }, [socket]);

  async function act(event: string) {
    setBusy(true);
    const ack = await emit(event, { pin });
    setBusy(false);
    if (!ack.ok) void message.error(ack.error);
  }

  const joinUrl = `${siteConfig.url}/student/games/join?pin=${pin}`;
  const isLastQuestion = question ? question.questionIndex + 1 >= totalQuestions : false;

  if (phase === "connecting") {
    return (
      <Card className="flex items-center justify-center p-12">
        <LoadingOutlined spin className="text-2xl" />
      </Card>
    );
  }

  if (phase === "lobby") {
    return (
      <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12">
        <Card className="flex flex-col items-center gap-4 p-8 text-center lg:col-span-5">
          <p className="font-label-md text-label-md text-on-surface-variant">{t("pinLabel")}</p>
          <p className="font-heading text-5xl font-bold tracking-[0.2em] text-primary sm:text-6xl">{pin}</p>
          <QRCode value={joinUrl} size={168} />
          <p className="text-body-sm text-on-surface-variant">{t("scanOrJoin")}</p>
        </Card>

        <Card
          title={
            <span className="flex items-center gap-2">
              <TeamOutlined /> {t("playersJoined", { count: players.length })}
            </span>
          }
          className="lg:col-span-7"
        >
          {players.length === 0 ? (
            <p className="py-8 text-center text-body-sm text-on-surface-variant">{t("waitingForPlayers")}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {players.map((player) => (
                <Tag key={player.studentId} className="!m-0 flex items-center gap-1.5 !py-1 !pl-1 !pr-2.5">
                  <Avatar size="small" src={player.avatarUrl}>
                    {player.name.charAt(0)}
                  </Avatar>
                  {player.name}
                  {player.level ? <LevelBadge level={player.level} showTitle={false} size="sm" /> : null}
                </Tag>
              ))}
            </div>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            <Button type="primary" size="large" icon={<ThunderboltOutlined />} disabled={players.length === 0} loading={busy} onClick={() => void act("start")}>
              {t("startGame")}
            </Button>
            <Button danger size="large" icon={<StopOutlined />} onClick={() => void act("end")}>
              {t("endRoom")}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (phase === "question" && question) {
    return (
      <Card>
        <div className="flex items-start justify-between gap-3">
          <p className="font-label-sm text-label-sm text-on-surface-variant">
            {t("questionProgress", { current: question.questionIndex + 1, total: totalQuestions })}
          </p>
          <p className={cn("font-heading text-headline-md tabular-nums", secondsLeft <= 5 && "text-error")}>{secondsLeft}s</p>
        </div>
        <h2 className="mt-2 font-heading text-headline-lg text-on-surface">{question.prompt}</h2>
        {question.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote Cloudinary URL, not worth Next/Image config for a teacher-uploaded quiz image
          <img src={question.imageUrl} alt="" className="mx-auto mt-4 max-h-64 rounded-lg object-contain" />
        ) : null}

        {question.kind === "multiple_choice" ? (
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {(question.options ?? []).map((option, index) => (
              <div key={index} className={cn("flex items-center gap-2 rounded-lg p-4 font-label-md text-label-md text-on-primary", OPTION_COLORS[index])}>
                <span className="font-bold">{"ABCD"[index]}</span>
                <span>{option}</span>
              </div>
            ))}
          </div>
        ) : null}

        {question.kind === "fill_blank" ? (
          <p className="mt-6 text-body-sm text-on-surface-variant">{t("fillBlankWait")}</p>
        ) : null}

        {question.kind === "scramble" ? (
          <div className="mt-6">
            <p className="mb-2 text-body-sm text-on-surface-variant">{t("scrambleHint")}</p>
            <div className="flex flex-wrap gap-2">
              {(question.scrambledLetters ?? []).map((letter, index) => (
                <span
                  key={index}
                  className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary font-heading text-headline-sm uppercase text-on-primary"
                >
                  {letter}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-6 flex items-center gap-3">
          <Progress percent={players.length ? Math.round((answeredCount / players.length) * 100) : 0} showInfo={false} className="flex-1" />
          <span className="whitespace-nowrap font-label-sm text-label-sm text-on-surface-variant">
            {t("answeredCount", { answered: answeredCount, total: players.length })}
          </span>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="primary" size="large" icon={<CheckCircleOutlined />} loading={busy} onClick={() => void act("reveal")}>
            {t("revealNow")}
          </Button>
          <Button danger size="large" icon={<StopOutlined />} onClick={() => void act("end")}>
            {t("endRoom")}
          </Button>
        </div>
      </Card>
    );
  }

  if (phase === "reveal" && reveal) {
    const total = players.length || 1;
    return (
      <Card>
        <p className="font-label-sm text-label-sm text-on-surface-variant">
          {t("questionProgress", { current: reveal.questionIndex + 1, total: totalQuestions })}
        </p>

        {reveal.kind === "multiple_choice" ? (
          <>
            <h2 className="mt-1 font-heading text-headline-md text-on-surface">
              {t("correctAnswerIs", { letter: "ABCD"[reveal.correctIndex ?? 0] ?? "" })}
            </h2>
            <div className="mt-4 flex flex-col gap-2">
              {(reveal.optionCounts ?? []).map((count, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="w-5 shrink-0 font-label-md text-label-md text-on-surface-variant">{"ABCD"[index]}</span>
                  <div className="h-8 flex-1 overflow-hidden rounded-md bg-surface-container-low">
                    <div
                      className={cn(
                        "flex h-full items-center px-2 font-label-sm text-label-sm text-on-primary transition-all",
                        index === reveal.correctIndex ? "bg-secondary" : OPTION_COLORS[index],
                      )}
                      style={{ width: `${Math.round((count / total) * 100)}%` }}
                    >
                      {count}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <h2 className="mt-1 font-heading text-headline-md text-on-surface">
              {t("correctAnswerIsText", { answer: reveal.correctAnswer ?? "" })}
            </h2>
            <div className="mt-4 flex flex-col gap-2">
              {(reveal.answerBreakdown ?? []).length === 0 ? (
                <p className="text-body-sm text-on-surface-variant">{t("noAnswersYet")}</p>
              ) : (
                (reveal.answerBreakdown ?? []).map((entry, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-md bg-surface-container-low px-3 py-2"
                  >
                    <span className="flex items-center gap-2 font-label-md text-label-md text-on-surface">
                      {entry.correct ? (
                        <CheckCircleOutlined className="text-secondary" />
                      ) : (
                        <CloseCircleOutlined className="text-error" />
                      )}
                      {entry.answer}
                    </span>
                    <span className="tabular-nums font-label-sm text-label-sm text-on-surface-variant">×{entry.count}</span>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        <h3 className="mt-6 font-heading text-headline-sm text-on-surface">{t("leaderboard")}</h3>
        <ol className="mt-2 flex flex-col gap-1.5">
          {reveal.leaderboard.slice(0, 5).map((entry) => (
            <li key={entry.studentId} className="flex items-center justify-between rounded-lg bg-surface-container-lowest px-3 py-2">
              <span className="flex min-w-0 items-center gap-2 font-label-md text-label-md text-on-surface">
                <span className="text-on-surface-variant">#{entry.rank}</span>
                <span className="truncate">{entry.studentName}</span>
                {entry.level ? <LevelBadge level={entry.level} title={entry.title} size="sm" /> : null}
              </span>
              <span className="font-heading text-headline-sm tabular-nums text-primary">{entry.score}</span>
            </li>
          ))}
        </ol>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="primary" size="large" icon={<ArrowRightOutlined />} loading={busy} onClick={() => void act("next")}>
            {isLastQuestion ? t("showResults") : t("nextQuestion")}
          </Button>
        </div>
      </Card>
    );
  }

  if (phase === "finished" && finished) {
    const podium = finished.leaderboard.slice(0, finished.topCount);
    return (
      <Card className="text-center">
        <TrophyOutlined className="text-5xl text-tertiary" />
        <h2 className="mt-2 font-heading text-headline-lg text-on-surface">{t("gameOver")}</h2>
        <ol className="mx-auto mt-6 flex max-w-md flex-col gap-2 text-left">
          {podium.map((entry) => (
            <li
              key={entry.studentId}
              className={cn(
                "flex items-center justify-between rounded-lg px-4 py-3",
                entry.rank === 1
                  ? "bg-tertiary-container/40"
                  : entry.rank <= 3
                    ? "bg-secondary-container/30"
                    : "bg-surface-container-lowest",
              )}
            >
              <span className="flex min-w-0 items-center gap-2 font-label-md text-label-md text-on-surface">
                <span className="font-heading text-headline-sm">#{entry.rank}</span>
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
    );
  }

  return null;
}
