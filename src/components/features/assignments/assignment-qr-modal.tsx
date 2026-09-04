"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Modal, QRCode, Typography, Button, Tag } from "antd";
import { QrcodeOutlined } from "@/components/icons";
import { siteConfig } from "@/lib/site";

const { Title, Paragraph, Text } = Typography;

function playUrlFor(assignmentId: string): string {
  return new URL(`/student/assignments/${assignmentId}`, siteConfig.url).toString();
}

/**
 * UC06 "live session" flow: teacher projects this QR, every student in the
 * room scans it with their phone camera and lands straight on the
 * assignment's start screen at the same time — the closest this
 * no-backend build gets to a Kahoot-style synchronized start. The QR points
 * at the existing `/student/assignments/[id]` intro page (no new student
 * route needed) so "Bắt đầu làm bài" there is still the actual start action.
 */
export function AssignmentQrModal({
  open,
  onClose,
  title,
  assignmentId,
  mode,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  assignmentId: string;
  mode: "quiz" | "matching";
}) {
  const t = useTranslations("dash.qr");
  const tc = useTranslations("dash.common");
  const playUrl = playUrlFor(assignmentId);

  return (
    <Modal open={open} onCancel={onClose} footer={null} centered title={null} width={400}>
      <div style={{ textAlign: "center", paddingTop: 8 }}>
        <Tag color={mode === "quiz" ? "blue" : "green"} style={{ marginBottom: 8 }}>
          {mode === "quiz" ? tc("quizFull") : tc("matchingFull")}
        </Tag>
        <Title level={4} style={{ marginTop: 0, marginBottom: 0 }}>
          {title}
        </Title>
        <Paragraph type="secondary" style={{ marginTop: 4 }}>
          {t("assignmentModalBody")}
        </Paragraph>

        <div style={{ display: "flex", justifyContent: "center", margin: "16px 0" }}>
          <QRCode value={playUrl} size={220} errorLevel="M" />
        </div>

        <Text type="secondary" style={{ fontSize: 12, wordBreak: "break-all" }}>
          {playUrl}
        </Text>
      </div>
    </Modal>
  );
}

/** Self-contained trigger + modal for the assignment list/report pages. */
export function AssignmentQrButton({
  title,
  assignmentId,
  mode,
}: {
  title: string;
  assignmentId: string;
  mode: "quiz" | "matching";
}) {
  const t = useTranslations("dash.qr");
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="primary" icon={<QrcodeOutlined />} onClick={() => setOpen(true)}>
        {t("assignmentButton")}
      </Button>
      <AssignmentQrModal open={open} onClose={() => setOpen(false)} title={title} assignmentId={assignmentId} mode={mode} />
    </>
  );
}
