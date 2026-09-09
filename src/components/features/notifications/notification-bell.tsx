"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Badge, Empty, Popover } from "antd";
import {
  BellOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  MailOutlined,
  ReadOutlined,
  TrophyOutlined,
} from "@/components/icons";
import { Link } from "@/i18n/navigation";
import { useNotifications } from "@/hooks/use-notifications";
import { timeAgo, cn } from "@/lib/utils";
import type { AppNotification, Role } from "@/lib/types";

function hrefFor(role: Role, notification: AppNotification): string | null {
  if (notification.type === "srs_review_due") return role === "student" ? "/student/review" : null;
  if (notification.type === "email_verification") return `/${role}/settings`;
  if (notification.type === "badge_earned") return `/${role}/settings`;
  if (!notification.assignmentId) return null;
  return role === "student"
    ? `/student/assignments/${notification.assignmentId}`
    : `/teacher/assignments/${notification.assignmentId}`;
}

function iconFor(type: AppNotification["type"]) {
  if (type === "srs_review_due") return { node: <ReadOutlined />, className: "text-secondary" };
  if (type === "deadline_reminder") return { node: <ClockCircleOutlined />, className: "text-tertiary" };
  if (type === "email_verification") return { node: <MailOutlined />, className: "text-primary" };
  if (type === "badge_earned") return { node: <TrophyOutlined />, className: "text-tertiary" };
  return { node: <FileTextOutlined />, className: "text-primary" };
}

/**
 * Bell icon + realtime dropdown for the exam-schedule feature's "nhắc lịch thi" requirement.
 * `initial` is fetched server-side by the role layout (so the badge isn't empty on first
 * paint); `useNotifications` then keeps it live over a WebSocket to the backend.
 */
export function NotificationBell({ role, initial }: { role: Role; initial: AppNotification[] }) {
  const t = useTranslations("dash.notifications");
  const { items, unreadCount, markRead, markAllRead } = useNotifications(initial);
  const [open, setOpen] = useState(false);

  const content = (
    <div className="flex w-80 max-w-[85vw] flex-col">
      <div className="flex items-center justify-between border-b border-outline-variant/40 px-1 pb-2">
        <span className="font-label-md text-label-md text-on-surface">{t("title")}</span>
        {unreadCount > 0 ? (
          <button type="button" onClick={markAllRead} className="font-label-sm text-label-sm text-primary hover:underline">
            {t("markAllRead")}
          </button>
        ) : null}
      </div>

      <div className="-mx-1 max-h-96 overflow-y-auto">
        {items.length === 0 ? (
          <Empty description={t("empty")} image={Empty.PRESENTED_IMAGE_SIMPLE} className="py-6" />
        ) : (
          items.map((notification) => {
            const href = hrefFor(role, notification);
            const icon = iconFor(notification.type);
            const body = (
              <div
                className={cn(
                  "flex gap-2.5 rounded-lg px-2 py-2.5 transition-colors hover:bg-surface-container-low",
                  !notification.read && "bg-primary-container/10",
                )}
              >
                <span className={cn("mt-0.5 text-lg", icon.className)}>{icon.node}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-label-md text-label-md text-on-surface">{notification.title}</p>
                  <p className="line-clamp-2 font-body-sm text-body-sm text-on-surface-variant">{notification.message}</p>
                  <p className="mt-0.5 font-label-sm text-label-sm text-on-surface-variant/70">{timeAgo(notification.createdAt)}</p>
                </div>
                {!notification.read ? <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden="true" /> : null}
              </div>
            );

            return (
              <div key={notification.id} onClick={() => !notification.read && markRead(notification.id)}>
                {href ? (
                  <Link href={href} className="block" onClick={() => setOpen(false)}>
                    {body}
                  </Link>
                ) : (
                  body
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      placement="bottomRight"
      open={open}
      onOpenChange={setOpen}
      styles={{ content: { padding: 12 } }}
    >
      <button
        type="button"
        className="relative rounded-full p-2 text-xl text-on-surface-variant transition-colors hover:bg-surface-variant hover:text-primary"
        aria-label={unreadCount > 0 ? t("ariaNew", { count: unreadCount }) : t("aria")}
      >
        <Badge count={unreadCount} size="small" offset={[-2, 2]}>
          <BellOutlined />
        </Badge>
      </button>
    </Popover>
  );
}
