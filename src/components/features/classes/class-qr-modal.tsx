"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Modal, QRCode, Typography, Button, Space } from "antd";
import { QrcodeOutlined } from "@/components/icons";
import { siteConfig } from "@/lib/site";

const { Title, Text, Paragraph } = Typography;

function joinUrlFor(code: string): string {
  return new URL(`/join/${code}`, siteConfig.url).toString();
}

/**
 * UC03/UC04 — the QR a teacher projects in class. Encodes a plain HTTPS link
 * (not an app deep link), so any student's stock phone camera can scan it
 * without TOPTI installed: scanning opens `/join/[code]` directly in their
 * browser. Built with antd (Modal/QRCode/Typography) per the "new UI work
 * uses antd" rule — see CLAUDE.md.
 */
export function ClassQrModal({
  open,
  onClose,
  roomName,
  classCode,
}: {
  open: boolean;
  onClose: () => void;
  roomName: string;
  classCode: string;
}) {
  const t = useTranslations("dash.qr");
  const joinUrl = joinUrlFor(classCode);

  return (
    <Modal open={open} onCancel={onClose} footer={null} centered title={null} width={400}>
      <div style={{ textAlign: "center", paddingTop: 8 }}>
        <Title level={4} style={{ marginBottom: 0 }}>
          {roomName}
        </Title>
        <Paragraph type="secondary" style={{ marginTop: 4 }}>
          {t("classModalBody")}
        </Paragraph>

        <div style={{ display: "flex", justifyContent: "center", margin: "16px 0" }}>
          <QRCode value={joinUrl} size={220} errorLevel="M" />
        </div>

        <Space direction="vertical" size={4} style={{ width: "100%" }}>
          <Text type="secondary">{t("orManual")}</Text>
          <Text
            copyable={{ text: classCode, tooltips: [t("copyCode"), t("copied")] }}
            style={{ fontSize: 28, fontWeight: 700, letterSpacing: "0.3em", color: "#004ac6" }}
          >
            {classCode}
          </Text>
        </Space>
      </div>
    </Modal>
  );
}

/** Self-contained trigger + modal, for dropping a "view class QR" action anywhere. */
export function ClassQrButton({ roomName, classCode }: { roomName: string; classCode: string }) {
  const t = useTranslations("dash.qr");
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button icon={<QrcodeOutlined />} onClick={() => setOpen(true)}>
        {t("classButton")}
      </Button>
      <ClassQrModal open={open} onClose={() => setOpen(false)} roomName={roomName} classCode={classCode} />
    </>
  );
}
