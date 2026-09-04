"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Form, Input, Button, Modal, Typography, Tooltip } from "antd";
import { KeyOutlined, MobileOutlined, ScanOutlined } from "@/components/icons";
import { joinClassByCode } from "@/lib/actions";
import { CLASS_CODE_LENGTH } from "@/lib/constants";
import { useRouter } from "@/i18n/navigation";

const { Paragraph, Text } = Typography;

export interface JoinableClass {
  id: string;
  code: string;
  name: string;
}

/** UC04 — ô nhập mã lớp gọn cho dashboard học sinh; nút biểu tượng QR bên cạnh mở hướng dẫn quét bằng camera điện thoại. */
export function JoinClassForm({ redirectBase = "/student/classes" }: { redirectBase?: string }) {
  const router = useRouter();
  const t = useTranslations("dash.joinForm");
  const tErr = useTranslations("joinErrors");
  const [form] = Form.useForm<{ code: string }>();
  const [scanGuideOpen, setScanGuideOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(values: { code: string }) {
    startTransition(async () => {
      const result = await joinClassByCode(values.code);
      if (!result.ok) {
        form.setFields([{ name: "code", errors: [tErr(result.error)] }]);
        return;
      }
      router.push(`${redirectBase}/${result.classId}`);
    });
  }

  return (
    <>
      <Form form={form} layout="inline" onFinish={handleSubmit} style={{ rowGap: 8 }}>
        <Form.Item
          name="code"
          style={{ flex: 1, minWidth: 200, marginInlineEnd: 8 }}
          rules={[
            { required: true, message: t("codeRequired") },
            { len: CLASS_CODE_LENGTH, message: t("codeLength", { length: CLASS_CODE_LENGTH }) },
          ]}
          normalize={(value: string) => value.toUpperCase()}
        >
          <Input
            size="large"
            maxLength={CLASS_CODE_LENGTH}
            placeholder={t("codePlaceholder")}
            aria-label={t("codeAria")}
            prefix={<KeyOutlined />}
            style={{ textAlign: "center", letterSpacing: "0.3em", textTransform: "uppercase" }}
          />
        </Form.Item>
        <Form.Item style={{ marginInlineEnd: 8 }}>
          <Tooltip title={t("scanTooltip")}>
            <Button size="large" icon={<ScanOutlined />} onClick={() => setScanGuideOpen(true)} />
          </Tooltip>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" size="large" loading={isPending}>
            {t("join")}
          </Button>
        </Form.Item>
      </Form>

      <Modal open={scanGuideOpen} onCancel={() => setScanGuideOpen(false)} footer={null} centered width={360}>
        <div style={{ textAlign: "center", padding: "16px 0 4px" }}>
          <MobileOutlined style={{ fontSize: 48, color: "#004ac6" }} />
          <Paragraph style={{ marginTop: 16, marginBottom: 4 }}>
            <Text strong>{t("scanTitle")}</Text> {t("scanBody")}
          </Paragraph>
          <Paragraph type="secondary" style={{ marginBottom: 0 }}>
            {t("scanHint")}
          </Paragraph>
        </div>
      </Modal>
    </>
  );
}
