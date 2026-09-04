"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  ArrowRightOutlined,
  FileAddOutlined,
  FolderAddOutlined,
  ReadOutlined,
  TeamOutlined,
} from "@/components/icons";
import { NAV_ITEMS, SECONDARY_NAV_ITEMS } from "@/lib/constants";
import { useRouter } from "@/i18n/navigation";
import { slugify } from "@/lib/utils";
import type { Role } from "@/lib/types";
import type { IconType } from "@/lib/constants";

export interface PaletteEntity {
  /** Nhóm hiển thị: "class" hoặc "teacher". */
  kind: "class" | "teacher";
  label: string;
  href: string;
}

interface Cmd {
  id: string;
  label: string;
  group: string;
  icon: IconType;
  run: () => void;
}

/**
 * Bảng lệnh nhanh (⌘K / Ctrl+K) cho giáo viên & admin: điều hướng, hành động
 * nhanh, nhảy tới từng lớp/giáo viên. Tự viết, không thư viện. Dùng `<dialog>`
 * để có focus-trap + Escape sẵn.
 */
export function CommandPalette({ role, entities }: { role: Role; entities: PaletteEntity[] }) {
  const t = useTranslations("commandPalette");
  const tNav = useTranslations("nav");
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("topti-open-command", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("topti-open-command", onOpen);
    };
  }, []);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      setQuery("");
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
    if (!open && d.open) d.close();
  }, [open]);

  const commands = useMemo<Cmd[]>(() => {
    const go = (href: string) => () => {
      setOpen(false);
      router.push(href);
    };
    const nav: Cmd[] = [...NAV_ITEMS[role], ...SECONDARY_NAV_ITEMS[role]].map((item) => ({
      id: `nav-${item.href}`,
      label: tNav(item.labelKey),
      group: t("groupNav"),
      icon: item.icon,
      run: go(item.href),
    }));

    const actions: Cmd[] = [];
    if (role === "teacher") {
      actions.push(
        { id: "act-class", label: t("actionCreateClass"), group: t("groupActions"), icon: FolderAddOutlined, run: go("/teacher/classes") },
        { id: "act-asn", label: t("actionNewAssignment"), group: t("groupActions"), icon: FileAddOutlined, run: go("/teacher/assignments/new") },
      );
    }

    const dynamic: Cmd[] = entities.map((e, i) => ({
      id: `ent-${i}`,
      label: e.label,
      group: e.kind === "class" ? t("groupClasses") : t("groupTeachers"),
      icon: e.kind === "class" ? ReadOutlined : TeamOutlined,
      run: go(e.href),
    }));

    return [...nav, ...actions, ...dynamic];
  }, [role, entities, router, t, tNav]);

  const filtered = useMemo(() => {
    const q = slugify(query.trim());
    if (!q) return commands;
    return commands.filter((c) => slugify(c.label).includes(q) || slugify(c.group).includes(q));
  }, [commands, query]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(filtered.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      filtered[active]?.run();
    }
  }

  let lastGroup = "";

  return (
    <dialog
      ref={dialogRef}
      onClose={() => setOpen(false)}
      onCancel={() => setOpen(false)}
      onClick={(e) => {
        if (e.target === dialogRef.current) setOpen(false);
      }}
      className="mt-[12vh] w-full max-w-lg rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-0 shadow-elevated backdrop:bg-on-surface/40 backdrop:backdrop-blur-sm"
      aria-label={t("open")}
    >
      <div className="border-b border-outline-variant/50 p-3">
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          placeholder={t("placeholder")}
          className="w-full bg-transparent px-2 py-1.5 text-body-md text-on-surface outline-none placeholder:text-outline"
          aria-label={t("placeholder")}
        />
      </div>
      <ul className="max-h-[52vh] overflow-y-auto p-2" role="listbox">
        {filtered.length === 0 ? (
          <li className="px-3 py-6 text-center text-body-sm text-on-surface-variant">{t("empty")}</li>
        ) : (
          filtered.map((c, i) => {
            const showGroup = c.group !== lastGroup;
            lastGroup = c.group;
            const Icon = c.icon;
            return (
              <li key={c.id}>
                {showGroup ? (
                  <p className="px-3 pb-1 pt-3 font-label-sm text-[11px] uppercase tracking-wide text-on-surface-variant">
                    {c.group}
                  </p>
                ) : null}
                <button
                  type="button"
                  role="option"
                  aria-selected={i === active}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => c.run()}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left font-label-md text-label-md transition-colors ${
                    i === active ? "bg-primary-container/15 text-primary" : "text-on-surface hover:bg-surface-variant"
                  }`}
                >
                  <Icon className="shrink-0 text-base opacity-70" aria-hidden="true" />
                  <span className="flex-1 truncate">{c.label}</span>
                  {i === active ? <ArrowRightOutlined className="shrink-0 text-xs opacity-60" aria-hidden="true" /> : null}
                </button>
              </li>
            );
          })
        )}
      </ul>
    </dialog>
  );
}
