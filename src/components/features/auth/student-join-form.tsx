"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Segmented, Form, Input, Button, Typography } from "antd";
import { KeyOutlined, MobileOutlined, ScanOutlined, UserAddOutlined } from "@/components/icons";
import { joinClassByCode } from "@/lib/actions";
import { CLASS_CODE_LENGTH } from "@/lib/constants";
import { useRouter } from "@/i18n/navigation";

const { Title, Paragraph, Text } = Typography;

type JoinMethod = "code" | "scan";

/** UC04 — học sinh vào lớp bằng cách nhập mã 6 ký tự hoặc quét mã QR giáo viên chiếu trên lớp bằng camera điện thoại. */
export function StudentJoinForm() {
  const router = useRouter();
  const t = useTranslations("auth.join");
  const tErr = useTranslations("joinErrors");
  const [method, setMethod] = useState<JoinMethod>("code");
  const [form] = Form.useForm<{ code: string }>();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(values: { code: string }) {
    startTransition(async () => {
      const result = await joinClassByCode(values.code);
      if (!result.ok) {
        form.setFields([{ name: "code", errors: [tErr(result.error)] }]);
        return;
      }
      router.push(`/student/classes/${result.classId}`);
    });
  }

  return (
    <div>
      <Title level={4} style={{ marginBottom: 4 }}>
        {t("title")}
      </Title>
      <Paragraph type="secondary" style={{ marginBottom: 20 }}>
        {t("subtitle")}
      </Paragraph>

      <Segmented<JoinMethod>
        block
        size="large"
        value={method}
        onChange={setMethod}
        options={[
          { label: t("methodCode"), value: "code", icon: <KeyOutlined /> },
          { label: t("methodScan"), value: "scan", icon: <ScanOutlined /> },
        ]}
        style={{ marginBottom: 20 }}
      />

      {method === "code" ? (
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="code"
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
              prefix={<KeyOutlined />}
              style={{ textAlign: "center", letterSpacing: "0.3em", textTransform: "uppercase" }}
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" size="large" icon={<UserAddOutlined />} loading={isPending} block>
            {t("submit")}
          </Button>
        </Form>
      ) : (
        <div style={{ textAlign: "center", padding: "12px 0" }}>
          <MobileOutlined style={{ fontSize: 48, color: "#004ac6" }} />
          <Paragraph style={{ marginTop: 16, marginBottom: 4 }}>
            <Text strong>{t("scanTitle")}</Text> {t("scanBody")}
          </Paragraph>
          <Paragraph type="secondary">{t("scanHint")}</Paragraph>
        </div>
      )}
    </div>
  );
}
