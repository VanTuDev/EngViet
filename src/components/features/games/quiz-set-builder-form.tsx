"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { App, Button, Card, Image, Input, InputNumber, Radio, Segmented, Space, Typography, Upload } from "antd";
import type { UploadProps } from "antd";
import {
  CloudUploadOutlined,
  DeleteOutlined,
  LoadingOutlined,
  PictureOutlined,
  PlusOutlined,
  RobotOutlined,
  RocketOutlined,
} from "@/components/icons";
import { AiGenerateQuizModal } from "@/components/features/games/ai-generate-quiz-modal";
import { createQuizSet, uploadGameImage } from "@/lib/actions";
import { useRouter } from "@/i18n/navigation";
import type { GameQuestion, GameQuestionKind } from "@/lib/types";

const MIN_TIME_LIMIT = 5;
const MAX_TIME_LIMIT = 120;
const DEFAULT_TIME_LIMIT = 20;
const MAX_ACCEPTED_ANSWERS = 8;
const SCRAMBLE_MIN_LENGTH = 2;
const SCRAMBLE_MAX_LENGTH = 40;

interface QuestionDraft {
  key: string;
  prompt: string;
  imageUrl?: string;
  kind: GameQuestionKind;
  /** Always length 4 — used only when `kind === "multiple_choice"`. */
  options: string[];
  correctIndex: number;
  /** At least one entry — used only when `kind === "fill_blank"`. */
  acceptedAnswers: string[];
  /** Used only when `kind === "scramble"`. */
  answer: string;
  timeLimitSeconds: number;
  uploading: boolean;
}

/** Avoids importing `@rc-component/upload` directly — pnpm's strict `node_modules` only resolves that package for antd's own internals, not this file. */
type CustomRequestOptions = Parameters<NonNullable<UploadProps["customRequest"]>>[0];

function emptyQuestion(key: string): QuestionDraft {
  return {
    key,
    prompt: "",
    imageUrl: undefined,
    kind: "multiple_choice",
    options: ["", "", "", ""],
    correctIndex: 0,
    acceptedAnswers: [""],
    answer: "",
    timeLimitSeconds: DEFAULT_TIME_LIMIT,
    uploading: false,
  };
}

function questionValid(question: QuestionDraft): boolean {
  if (question.prompt.trim().length === 0) return false;
  if (question.kind === "multiple_choice") return question.options.every((o) => o.trim().length > 0);
  if (question.kind === "fill_blank") return question.acceptedAnswers.some((a) => a.trim().length > 0);
  const word = question.answer.trim();
  return word.length >= SCRAMBLE_MIN_LENGTH && word.length <= SCRAMBLE_MAX_LENGTH;
}

function toPayloadQuestion(question: QuestionDraft): GameQuestion {
  const base: GameQuestion = {
    prompt: question.prompt.trim(),
    imageUrl: question.imageUrl,
    kind: question.kind,
    timeLimitSeconds: question.timeLimitSeconds,
  };
  if (question.kind === "multiple_choice") {
    return { ...base, options: question.options.map((o) => o.trim()), correctIndex: question.correctIndex };
  }
  if (question.kind === "fill_blank") {
    return { ...base, acceptedAnswers: question.acceptedAnswers.map((a) => a.trim()).filter(Boolean) };
  }
  return { ...base, answer: question.answer.trim() };
}

export function QuizSetBuilderForm() {
  const t = useTranslations("dash.games.builder");
  const { message, modal } = App.useApp();
  const router = useRouter();
  const keyPrefix = useId();
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<QuestionDraft[]>([emptyQuestion(`${keyPrefix}-0`)]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  function updateQuestion(key: string, patch: Partial<QuestionDraft>) {
    setQuestions((prev) => prev.map((q) => (q.key === key ? { ...q, ...patch } : q)));
  }

  function updateOption(key: string, index: number, value: string) {
    setQuestions((prev) =>
      prev.map((q) => (q.key === key ? { ...q, options: q.options.map((o, i) => (i === index ? value : o)) } : q)),
    );
  }

  function updateAcceptedAnswer(key: string, index: number, value: string) {
    setQuestions((prev) =>
      prev.map((q) =>
        q.key === key ? { ...q, acceptedAnswers: q.acceptedAnswers.map((a, i) => (i === index ? value : a)) } : q,
      ),
    );
  }

  function addAcceptedAnswer(key: string) {
    setQuestions((prev) =>
      prev.map((q) =>
        q.key === key && q.acceptedAnswers.length < MAX_ACCEPTED_ANSWERS
          ? { ...q, acceptedAnswers: [...q.acceptedAnswers, ""] }
          : q,
      ),
    );
  }

  function removeAcceptedAnswer(key: string, index: number) {
    setQuestions((prev) =>
      prev.map((q) =>
        q.key === key && q.acceptedAnswers.length > 1
          ? { ...q, acceptedAnswers: q.acceptedAnswers.filter((_, i) => i !== index) }
          : q,
      ),
    );
  }

  function addQuestion() {
    setQuestions((prev) => [...prev, emptyQuestion(`${keyPrefix}-${prev.length}-${Date.now()}`)]);
  }

  function removeQuestion(key: string) {
    setQuestions((prev) => (prev.length > 1 ? prev.filter((q) => q.key !== key) : prev));
  }

  function applyGenerated(draft: { title: string; questions: GameQuestion[] }) {
    if (!title.trim()) setTitle(draft.title);
    setQuestions(
      draft.questions.map((q, i) => ({
        key: `${keyPrefix}-ai-${Date.now()}-${i}`,
        prompt: q.prompt,
        imageUrl: q.imageUrl,
        kind: q.kind ?? "multiple_choice",
        options: q.options && q.options.length === 4 ? q.options : ["", "", "", ""],
        correctIndex: q.correctIndex ?? 0,
        acceptedAnswers: q.acceptedAnswers && q.acceptedAnswers.length > 0 ? q.acceptedAnswers : [""],
        answer: q.answer ?? "",
        timeLimitSeconds: q.timeLimitSeconds,
        uploading: false,
      })),
    );
  }

  function handleGenerated(draft: { title: string; questions: GameQuestion[] }) {
    const hasExistingContent = questions.some(
      (q) =>
        q.prompt.trim().length > 0 ||
        q.options.some((o) => o.trim().length > 0) ||
        q.acceptedAnswers.some((a) => a.trim().length > 0) ||
        q.answer.trim().length > 0,
    );
    if (!hasExistingContent) {
      applyGenerated(draft);
      return;
    }
    modal.confirm({
      title: t("ai.replaceConfirmTitle"),
      content: t("ai.replaceConfirmBody"),
      okText: t("ai.replaceConfirmOk"),
      cancelText: t("ai.replaceConfirmCancel"),
      onOk: () => applyGenerated(draft),
    });
  }

  async function handleUpload(key: string, options: CustomRequestOptions) {
    const file = options.file as File;
    updateQuestion(key, { uploading: true });
    const formData = new FormData();
    formData.append("file", file);
    const res = await uploadGameImage(formData);
    updateQuestion(key, { uploading: false });
    if (res.ok) {
      updateQuestion(key, { imageUrl: res.url });
      options.onSuccess?.(res);
    } else {
      void message.error(res.error);
      options.onError?.(new Error(res.error));
    }
  }

  const canSubmit = title.trim().length >= 2 && questions.length > 0 && questions.every(questionValid);

  async function handleSubmit() {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError(null);
    const res = await createQuizSet({ title: title.trim(), questions: questions.map(toPayloadQuestion) });
    setSubmitting(false);
    if (res.ok) {
      router.push("/teacher/games");
      router.refresh();
    } else {
      setError(res.error);
    }
  }

  const KIND_OPTIONS: { label: string; value: GameQuestionKind }[] = [
    { label: t("kindMultipleChoice"), value: "multiple_choice" },
    { label: t("kindFillBlank"), value: "fill_blank" },
    { label: t("kindScramble"), value: "scramble" },
  ];

  return (
    <div className="flex flex-col gap-gutter">
      <Button
        type="dashed"
        size="large"
        icon={<RobotOutlined />}
        onClick={() => setAiModalOpen(true)}
        className="w-full !border-primary/40 !text-primary"
      >
        {t("ai.trigger")}
      </Button>
      <AiGenerateQuizModal open={aiModalOpen} onClose={() => setAiModalOpen(false)} onGenerated={handleGenerated} />

      <Card>
        <label className="mb-1.5 block font-label-md text-label-md text-on-surface">{t("titleLabel")}</label>
        <Input size="large" placeholder={t("titlePlaceholder")} value={title} onChange={(e) => setTitle(e.target.value)} />
      </Card>

      {questions.map((question, index) => {
        const promptLabel =
          question.kind === "fill_blank"
            ? t("promptLabelFillBlank")
            : question.kind === "scramble"
              ? t("promptLabelScramble")
              : t("promptLabel");
        const promptPlaceholder =
          question.kind === "fill_blank"
            ? t("promptPlaceholderFillBlank")
            : question.kind === "scramble"
              ? t("promptPlaceholderScramble")
              : t("promptPlaceholder");

        return (
          <Card
            key={question.key}
            title={t("questionTitle", { index: index + 1 })}
            extra={
              questions.length > 1 ? (
                <Button danger type="text" icon={<DeleteOutlined />} onClick={() => removeQuestion(question.key)}>
                  {t("removeQuestion")}
                </Button>
              ) : undefined
            }
          >
            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block font-label-sm text-label-sm text-on-surface-variant">{t("kindLabel")}</label>
                <Segmented
                  block
                  value={question.kind}
                  onChange={(value) => updateQuestion(question.key, { kind: value as GameQuestionKind })}
                  options={KIND_OPTIONS}
                />
              </div>

              <div>
                <label className="mb-1.5 block font-label-sm text-label-sm text-on-surface-variant">{promptLabel}</label>
                <Input.TextArea
                  autoSize={{ minRows: 1, maxRows: 3 }}
                  placeholder={promptPlaceholder}
                  value={question.prompt}
                  onChange={(e) => updateQuestion(question.key, { prompt: e.target.value })}
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {question.imageUrl ? (
                  <Image src={question.imageUrl} alt="" width={96} height={96} className="rounded-lg object-cover" />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-lg border border-dashed border-outline-variant text-2xl text-on-surface-variant/60">
                    <PictureOutlined />
                  </div>
                )}
                <Upload
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  showUploadList={false}
                  customRequest={(options) => void handleUpload(question.key, options)}
                >
                  <Button icon={question.uploading ? <LoadingOutlined spin /> : <CloudUploadOutlined />} disabled={question.uploading}>
                    {question.imageUrl ? t("changeImage") : t("addImage")}
                  </Button>
                </Upload>
              </div>

              {question.kind === "multiple_choice" ? (
                <div>
                  <label className="mb-1.5 block font-label-sm text-label-sm text-on-surface-variant">{t("optionsLabel")}</label>
                  <Radio.Group
                    className="w-full"
                    value={question.correctIndex}
                    onChange={(e) => updateQuestion(question.key, { correctIndex: Number(e.target.value) })}
                  >
                    <Space direction="vertical" className="w-full">
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center gap-2">
                          <Radio value={optionIndex} aria-label={t("markCorrect", { letter: "ABCD"[optionIndex] ?? "" })} />
                          <span className="w-5 shrink-0 font-label-md text-label-md text-on-surface-variant">
                            {"ABCD"[optionIndex]}
                          </span>
                          <Input
                            placeholder={t("optionPlaceholder", { letter: "ABCD"[optionIndex] ?? "" })}
                            value={option}
                            onChange={(e) => updateOption(question.key, optionIndex, e.target.value)}
                          />
                        </div>
                      ))}
                    </Space>
                  </Radio.Group>
                  <p className="mt-1 font-label-sm text-label-sm text-on-surface-variant">{t("correctHint")}</p>
                </div>
              ) : null}

              {question.kind === "fill_blank" ? (
                <div>
                  <label className="mb-1.5 block font-label-sm text-label-sm text-on-surface-variant">
                    {t("acceptedAnswersLabel")}
                  </label>
                  <Space direction="vertical" className="w-full">
                    {question.acceptedAnswers.map((accepted, acceptedIndex) => (
                      <div key={acceptedIndex} className="flex items-center gap-2">
                        <Input
                          placeholder={t("acceptedAnswerPlaceholder")}
                          value={accepted}
                          onChange={(e) => updateAcceptedAnswer(question.key, acceptedIndex, e.target.value)}
                        />
                        {question.acceptedAnswers.length > 1 ? (
                          <Button
                            type="text"
                            icon={<DeleteOutlined />}
                            aria-label={t("removeAcceptedAnswer")}
                            onClick={() => removeAcceptedAnswer(question.key, acceptedIndex)}
                          />
                        ) : null}
                      </div>
                    ))}
                  </Space>
                  {question.acceptedAnswers.length < MAX_ACCEPTED_ANSWERS ? (
                    <Button
                      type="link"
                      size="small"
                      icon={<PlusOutlined />}
                      className="!px-0"
                      onClick={() => addAcceptedAnswer(question.key)}
                    >
                      {t("addAcceptedAnswer")}
                    </Button>
                  ) : null}
                  <p className="mt-1 font-label-sm text-label-sm text-on-surface-variant">{t("acceptedAnswersHint")}</p>
                </div>
              ) : null}

              {question.kind === "scramble" ? (
                <div className="max-w-sm">
                  <label className="mb-1.5 block font-label-sm text-label-sm text-on-surface-variant">
                    {t("scrambleAnswerLabel")}
                  </label>
                  <Input
                    placeholder={t("scrambleAnswerPlaceholder")}
                    value={question.answer}
                    onChange={(e) => updateQuestion(question.key, { answer: e.target.value })}
                  />
                  <p className="mt-1 font-label-sm text-label-sm text-on-surface-variant">{t("scrambleAnswerHint")}</p>
                </div>
              ) : null}

              <div className="max-w-[220px]">
                <label className="mb-1.5 block font-label-sm text-label-sm text-on-surface-variant">{t("timeLimitLabel")}</label>
                <InputNumber
                  className="w-full"
                  min={MIN_TIME_LIMIT}
                  max={MAX_TIME_LIMIT}
                  value={question.timeLimitSeconds}
                  onChange={(value) => updateQuestion(question.key, { timeLimitSeconds: value ?? DEFAULT_TIME_LIMIT })}
                  addonAfter={t("seconds")}
                />
              </div>
            </div>
          </Card>
        );
      })}

      <Button type="dashed" size="large" icon={<PlusOutlined />} onClick={addQuestion} className="w-full">
        {t("addQuestion")}
      </Button>

      {error ? <Typography.Text type="danger">{error}</Typography.Text> : null}

      <Button type="primary" size="large" icon={<RocketOutlined />} loading={submitting} disabled={!canSubmit} onClick={() => void handleSubmit()}>
        {t("submit")}
      </Button>
      {!canSubmit ? <Typography.Text type="secondary">{t("cannotSubmit")}</Typography.Text> : null}
    </div>
  );
}
