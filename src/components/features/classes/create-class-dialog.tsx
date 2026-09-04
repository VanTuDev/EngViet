"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Modal, Form, Input, Button, QRCode, Typography, Space } from "antd";
import { PlusOutlined } from "@/components/icons";
import { createClass } from "@/lib/actions";
import { siteConfig } from "@/lib/site";
import { useRouter } from "@/i18n/navigation";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface CreateClassFormValues {
  name: string;
  description?: string;
}

/** UC03 — teacher creates a class and receives a shareable 6-character class code + QR. Built with antd per the "new UI work uses antd" rule (CLAUDE.md). */
export function CreateClassDialog() {
  const router = useRouter();
  const t = useTranslations("dash.classDialog");
  const [form] = Form.useForm<CreateClassFormValues>();
  const [open, setOpen] = useState(false);
  const [created, setCreated] = useState<{ name: string; code: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(values: CreateClassFormValues) {
    startTransition(async () => {
      const classRoom = await createClass(values);
      setCreated({ name: classRoom.name, code: classRoom.code });
      router.refresh();
    });
  }

  function handleClose() {
    setOpen(false);
    setTimeout(() => {
      form.resetFields();
      setCreated(null);
    }, 200);
  }

  return (
    <>
      <Button type="primary" icon={<PlusOutlined />} block onClick={() => setOpen(true)} style={{ marginBottom: 16 }}>
        {t("trigger")}
      </Button>

      <Modal
        open={open}
        onCancel={handleClose}
        footer={null}
        title={created ? null : t("modalTitle")}
        centered
        width={400}
        destroyOnHidden
      >
        {created ? (
          <div style={{ textAlign: "center", paddingTop: 8 }}>
            <Title level={4} style={{ marginBottom: 0 }}>
              {t("readyTitle", { name: created.name })}
            </Title>
            <Paragraph type="secondary" style={{ marginTop: 4 }}>
              {t("readyBody")}
            </Paragraph>

            <div style={{ display: "flex", justifyContent: "center", margin: "16px 0" }}>
              <QRCode value={new URL(`/join/${created.code}`, siteConfig.url).toString()} size={200} errorLevel="M" />
            </div>

            <Space direction="vertical" size={4} style={{ width: "100%", marginBottom: 20 }}>
              <Text type="secondary">{t("orReadCode")}</Text>
              <Text
                copyable={{ text: created.code, tooltips: [t("copyCode"), t("copied")] }}
                style={{ fontSize: 28, fontWeight: 700, letterSpacing: "0.3em", color: "#004ac6" }}
              >
                {created.code}
              </Text>
            </Space>

            <Button type="primary" block onClick={handleClose}>
              {t("done")}
            </Button>
          </div>
        ) : (
          <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
            <Form.Item
              name="name"
              label={t("nameLabel")}
              rules={[{ required: true, message: t("nameRequired") }]}
            >
              <Input placeholder={t("namePlaceholder")} autoFocus />
            </Form.Item>
            <Form.Item name="description" label={t("descLabel")}>
              <TextArea rows={3} placeholder={t("descPlaceholder")} />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0 }}>
              <Button type="primary" htmlType="submit" loading={isPending} block>
                {t("createAndGetCode")}
              </Button>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </>
  );
}
