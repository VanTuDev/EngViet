"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button, App } from "antd";
import { UserAddOutlined } from "@/components/icons";
import { joinClassByCode } from "@/lib/actions";
import { useRouter } from "@/i18n/navigation";

/**
 * Nút xác nhận một chạm cho luồng quét QR (`/join/[code]`) — mã lớp đã biết từ
 * URL nên chỉ cần một hành động "Xác nhận tham gia" thay vì cả form nhập mã.
 */
export function JoinByCodeButton({ code }: { code: string }) {
  const router = useRouter();
  const t = useTranslations("auth.joinByCode");
  const tErr = useTranslations("joinErrors");
  const { message } = App.useApp();
  const [isPending, startTransition] = useTransition();

  function handleJoin() {
    startTransition(async () => {
      const result = await joinClassByCode(code);
      if (!result.ok) {
        message.error(tErr(result.error));
        return;
      }
      router.push(`/student/classes/${result.classId}`);
    });
  }

  return (
    <Button type="primary" size="large" icon={<UserAddOutlined />} loading={isPending} onClick={handleJoin} block>
      {t("confirm")}
    </Button>
  );
}
