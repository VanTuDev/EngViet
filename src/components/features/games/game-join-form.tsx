"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button, Input, Typography } from "antd";
import { ThunderboltOutlined } from "@/components/icons";
import { useRouter } from "@/i18n/navigation";

const PIN_LENGTH = 6;

export function GameJoinForm({ initialPin }: { initialPin?: string }) {
  const t = useTranslations("dash.games.join");
  const router = useRouter();
  const [pin, setPin] = useState(initialPin ?? "");

  const canSubmit = /^\d{6}$/.test(pin);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    router.push(`/student/games/play/${pin}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
      <Input
        size="large"
        inputMode="numeric"
        maxLength={PIN_LENGTH}
        placeholder="000000"
        value={pin}
        onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, PIN_LENGTH))}
        className="!w-56 text-center !text-2xl !tracking-[0.5em]"
      />
      <Button type="primary" size="large" htmlType="submit" icon={<ThunderboltOutlined />} disabled={!canSubmit} block className="!max-w-56">
        {t("joinButton")}
      </Button>
      <Typography.Text type="secondary">{t("hint")}</Typography.Text>
    </form>
  );
}
