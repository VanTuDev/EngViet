"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { App, Button, Modal, Radio, Space } from "antd";
import { DeleteOutlined, PlayCircleOutlined } from "@/components/icons";
import { createGameSession, deleteQuizSet } from "@/lib/actions";
import { useRouter } from "@/i18n/navigation";
import type { GameTopCount } from "@/lib/types";

const TOP_COUNT_OPTIONS: GameTopCount[] = [3, 5, 10];

export function QuizSetRowActions({ quizSetId }: { quizSetId: string }) {
  const t = useTranslations("dash.games.list");
  const { message, modal } = App.useApp();
  const router = useRouter();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [topCount, setTopCount] = useState<GameTopCount>(3);
  const [starting, setStarting] = useState(false);

  async function handleStart() {
    setStarting(true);
    const res = await createGameSession({ quizSetId, topCount });
    setStarting(false);
    if (res.ok) {
      router.push(`/teacher/games/sessions/${res.session.id}/host`);
    } else {
      void message.error(res.error);
    }
  }

  function handleDelete() {
    modal.confirm({
      title: t("deleteConfirmTitle"),
      content: t("deleteConfirmBody"),
      okButtonProps: { danger: true },
      okText: t("deleteConfirmOk"),
      cancelText: t("deleteConfirmCancel"),
      onOk: async () => {
        const res = await deleteQuizSet(quizSetId);
        if (res.ok) {
          router.refresh();
        } else {
          void message.error(res.error ?? t("deleteFailed"));
        }
      },
    });
  }

  return (
    <>
      <Space>
        <Button type="primary" icon={<PlayCircleOutlined />} onClick={() => setPickerOpen(true)}>
          {t("start")}
        </Button>
        <Button danger type="text" icon={<DeleteOutlined />} onClick={handleDelete} aria-label={t("delete")} />
      </Space>

      <Modal
        title={t("pickTopCountTitle")}
        open={pickerOpen}
        onCancel={() => setPickerOpen(false)}
        onOk={() => void handleStart()}
        okText={t("startConfirm")}
        confirmLoading={starting}
      >
        <p className="mb-3 text-body-sm text-on-surface-variant">{t("pickTopCountDesc")}</p>
        <Radio.Group value={topCount} onChange={(e) => setTopCount(Number(e.target.value) as GameTopCount)}>
          <Space direction="vertical">
            {TOP_COUNT_OPTIONS.map((count) => (
              <Radio key={count} value={count}>
                {t("topCountOption", { count })}
              </Radio>
            ))}
          </Space>
        </Radio.Group>
      </Modal>
    </>
  );
}
