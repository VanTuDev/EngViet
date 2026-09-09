"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Popover, Tooltip } from "antd";
import { CheckOutlined, DownOutlined, ReadOutlined, RocketOutlined, SwapOutlined } from "@/components/icons";
import { useAuth } from "@/components/auth/auth-provider";
import { Link, useRouter } from "@/i18n/navigation";
import type { WorkspaceMode } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * Bộ chuyển khu làm việc, đặt ở đầu sidebar.
 *
 * - Học sinh đã xác thực email / giáo viên (`canTeach`): dropdown chuyển qua lại
 *   giữa "Học tập" (`/student/*`) và "Quản trị giáo viên" (`/teacher/*`).
 * - Học sinh chưa xác thực: một nút gợi ý "Trở thành giáo viên" dẫn tới trang
 *   cài đặt để xác thực email.
 * - Admin: không hiển thị gì (khu quản trị hệ thống không chuyển đổi).
 */
export function WorkspaceSwitcher({
  mode,
  onNavigate,
  collapsed = false,
}: {
  mode: WorkspaceMode;
  onNavigate?: () => void;
  collapsed?: boolean;
}) {
  const t = useTranslations("workspace");
  const { user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  if (mode === "admin") return null;

  const canTeach = user?.canTeach ?? false;

  // Học sinh chưa mở khoá giáo viên — chỉ hiện lời mời xác thực.
  if (!canTeach) {
    if (collapsed) {
      return (
        <Tooltip title={t("becomeTeacher")} placement="right">
          <Link
            href="/student/settings"
            onClick={onNavigate}
            aria-label={t("becomeTeacher")}
            className="mb-1 flex h-11 w-11 items-center justify-center rounded-xl border border-dashed border-outline-variant text-lg text-primary transition-colors hover:border-primary/60 hover:bg-primary/10"
          >
            <RocketOutlined aria-hidden="true" />
          </Link>
        </Tooltip>
      );
    }
    return (
      <Link
        href="/student/settings"
        onClick={onNavigate}
        className="mb-4 flex items-start gap-3 rounded-xl border border-dashed border-outline-variant bg-surface-container-low px-3 py-2.5 text-left transition-colors hover:border-primary/60 hover:bg-primary/10"
      >
        <RocketOutlined className="mt-0.5 shrink-0 text-lg text-primary" aria-hidden="true" />
        <span className="min-w-0">
          <span className="block font-label-md text-label-md text-on-surface">{t("becomeTeacher")}</span>
          <span className="block font-label-sm text-label-sm text-on-surface-variant">{t("becomeTeacherHint")}</span>
        </span>
      </Link>
    );
  }

  const studentOption = {
    key: "student" as const,
    label: t("learn"),
    hint: t("learnHint"),
    href: "/student/dashboard",
    icon: ReadOutlined,
  };
  const teacherOption = {
    key: "teacher" as const,
    label: t("teach"),
    hint: t("teachHint"),
    href: "/teacher/dashboard",
    icon: RocketOutlined,
  };
  const options = [studentOption, teacherOption];
  const active = mode === "teacher" ? teacherOption : studentOption;

  function go(href: string, key: WorkspaceMode) {
    setOpen(false);
    onNavigate?.();
    if (key !== mode) router.push(href);
  }

  const menu = (
    <div className="flex w-64 max-w-[80vw] flex-col gap-1">
      <p className="px-2 pb-1 font-label-sm text-label-sm text-on-surface-variant">{t("switchLabel")}</p>
      {options.map((o) => {
        const Icon = o.icon;
        const isActive = o.key === mode;
        return (
          <button
            key={o.key}
            type="button"
            onClick={() => go(o.href, o.key)}
            aria-current={isActive ? "true" : undefined}
            className={cn(
              "flex items-start gap-3 rounded-lg px-2 py-2 text-left transition-colors",
              isActive ? "bg-primary-container/20" : "hover:bg-surface-variant",
            )}
          >
            <Icon className="mt-0.5 shrink-0 text-lg text-primary" aria-hidden="true" />
            <span className="min-w-0 flex-1">
              <span className="block font-label-md text-label-md text-on-surface">{o.label}</span>
              <span className="block font-label-sm text-label-sm text-on-surface-variant">{o.hint}</span>
            </span>
            {isActive ? <CheckOutlined className="mt-1 shrink-0 text-primary" aria-hidden="true" /> : null}
          </button>
        );
      })}
    </div>
  );

  const ActiveIcon = active.icon;

  if (collapsed) {
    return (
      <Popover
        content={menu}
        trigger="click"
        open={open}
        onOpenChange={setOpen}
        placement="rightTop"
        arrow={false}
      >
        <button
          type="button"
          aria-label={`${t("switchLabel")}: ${active.label}`}
          title={`${t("switchLabel")}: ${active.label}`}
          className="mb-1 flex h-11 w-11 items-center justify-center rounded-xl border border-outline-variant bg-surface-container-lowest text-lg text-primary transition-colors hover:bg-surface-variant"
        >
          <ActiveIcon aria-hidden="true" />
        </button>
      </Popover>
    );
  }

  return (
    <Popover
      content={menu}
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      placement="bottomLeft"
      arrow={false}
    >
      <button
        type="button"
        aria-label={t("switchLabel")}
        className="mb-4 flex w-full items-center gap-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2.5 text-left transition-colors hover:bg-surface-variant"
      >
        <ActiveIcon className="shrink-0 text-lg text-primary" aria-hidden="true" />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant">
            <SwapOutlined aria-hidden="true" />
            {t("switchLabel")}
          </span>
          <span className="block truncate font-label-md text-label-md text-on-surface">{active.label}</span>
        </span>
        <DownOutlined className={cn("shrink-0 text-xs text-on-surface-variant transition-transform", open && "rotate-180")} aria-hidden="true" />
      </button>
    </Popover>
  );
}
