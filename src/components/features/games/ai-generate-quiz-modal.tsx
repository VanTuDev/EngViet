"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { App, Button, Input, InputNumber, Modal, Typography, Upload } from "antd";
import { CloudUploadOutlined, RobotOutlined } from "@/components/icons";
import { generateQuizSetWithAI } from "@/lib/actions";
import type { GameQuestion } from "@/lib/types";

const DEFAULT_QUESTION_COUNT = 8;
const MIN_QUESTION_COUNT = 1;
const MAX_QUESTION_COUNT = 20;
const MAX_DOCUMENT_BYTES = 15 * 1024 * 1024;
const ACCEPTED_DOCUMENT_TYPES = new Set(["application/pdf", "text/plain"]);

export function AiGenerateQuizModal({
  open,
  onClose,
  onGenerated,
}: {
  open: boolean;
  onClose: () => void;
  onGenerated: (draft: { title: string; questions: GameQuestion[] }) => void;
}) {
  const t = useTranslations("dash.games.builder.ai");
  const { message } = App.useApp();
  const [prompt, setPrompt] = useState("");
  const [questionCount, setQuestionCount] = useState(DEFAULT_QUESTION_COUNT);
  const [sourceText, setSourceText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [generating, setGenerating] = useState(false);

  const canSubmit = prompt.trim().length >= 3 && !generating;

  function reset() {
    setPrompt("");
    setQuestionCount(DEFAULT_QUESTION_COUNT);
    setSourceText("");
    setFile(null);
  }

  async function handleGenerate() {
    if (!canSubmit) return;
    setGenerating(true);
    const formData = new FormData();
    formData.append("prompt", prompt.trim());
    formData.append("questionCount", String(questionCount));
    if (sourceText.trim()) formData.append("sourceText", sourceText.trim());
    if (file) formData.append("file", file);

    const res = await generateQuizSetWithAI(formData);
    setGenerating(false);
    if (res.ok) {
      onGenerated({ title: res.title, questions: res.questions });
      void message.success(t("success", { count: res.questions.length }));
      reset();
      onClose();
    } else {
      void message.error(res.error);
    }
  }

  return (
    <Modal
      title={
        <span className="flex items-center gap-2">
          <RobotOutlined /> {t("modalTitle")}
        </span>
      }
      open={open}
      onCancel={() => {
        if (!generating) onClose();
      }}
      onOk={() => void handleGenerate()}
      okText={t("generate")}
      confirmLoading={generating}
      okButtonProps={{ disabled: !canSubmit }}
      width={560}
    >
      <div className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block font-label-sm text-label-sm text-on-surface-variant">{t("promptLabel")}</label>
          <Input.TextArea
            autoSize={{ minRows: 2, maxRows: 4 }}
            placeholder={t("promptPlaceholder")}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={generating}
          />
        </div>

        <div className="max-w-[200px]">
          <label className="mb-1.5 block font-label-sm text-label-sm text-on-surface-variant">{t("questionCountLabel")}</label>
          <InputNumber
            className="w-full"
            min={MIN_QUESTION_COUNT}
            max={MAX_QUESTION_COUNT}
            value={questionCount}
            onChange={(value) => setQuestionCount(value ?? DEFAULT_QUESTION_COUNT)}
            disabled={generating}
          />
        </div>

        <div>
          <label className="mb-1.5 block font-label-sm text-label-sm text-on-surface-variant">{t("sourceTextLabel")}</label>
          <Input.TextArea
            autoSize={{ minRows: 2, maxRows: 6 }}
            placeholder={t("sourceTextPlaceholder")}
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            disabled={generating}
          />
        </div>

        <div>
          <label className="mb-1.5 block font-label-sm text-label-sm text-on-surface-variant">{t("fileLabel")}</label>
          <Upload
            accept=".pdf,.txt"
            maxCount={1}
            disabled={generating}
            beforeUpload={(candidate) => {
              if (!ACCEPTED_DOCUMENT_TYPES.has(candidate.type)) {
                void message.error(t("fileTypeError"));
                return Upload.LIST_IGNORE;
              }
              if (candidate.size > MAX_DOCUMENT_BYTES) {
                void message.error(t("fileSizeError"));
                return Upload.LIST_IGNORE;
              }
              setFile(candidate);
              return false;
            }}
            onRemove={() => setFile(null)}
            fileList={file ? [{ uid: "1", name: file.name, status: "done" }] : []}
          >
            <Button icon={<CloudUploadOutlined />} disabled={generating}>
              {t("chooseFile")}
            </Button>
          </Upload>
        </div>

        <Typography.Text type="secondary">{t("hint")}</Typography.Text>
      </div>
    </Modal>
  );
}
