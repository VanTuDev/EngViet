"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { App, Button, Input, Select } from "antd";
import {
  CloudUploadOutlined,
  DeleteOutlined,
  DownloadOutlined,
  PlusOutlined,
} from "@/components/icons";
import { createDeck, updateDeck } from "@/lib/actions";
import { DECK_CSV_HEADER, parseDeckCsv } from "@/lib/deck-csv";
import { downloadTextFile } from "@/lib/download";
import { useRouter } from "@/i18n/navigation";
import type { DeckEntry, VocabDeck } from "@/lib/types";

const MAX_ENTRIES = 500;
const blankRow = (): DeckEntry => ({ word: "", ipa: "", meaning: "", example: "" });

export function DeckForm({
  mode,
  deck,
  ownedClasses,
  defaultClassId,
}: {
  mode: "create" | "edit";
  deck?: VocabDeck;
  ownedClasses: { id: string; name: string }[];
  /** Pre-select a class on a fresh deck (e.g. "create a deck for this class" from the teacher page). */
  defaultClassId?: string;
}) {
  const t = useTranslations("dash.decks.form");
  const { message } = App.useApp();
  const router = useRouter();
  const fileRef = React.useRef<HTMLInputElement>(null);

  const [title, setTitle] = React.useState(deck?.title ?? "");
  const [description, setDescription] = React.useState(deck?.description ?? "");
  const [classId, setClassId] = React.useState<string | undefined>(
    deck?.classId ?? (defaultClassId && ownedClasses.some((c) => c.id === defaultClassId) ? defaultClassId : undefined),
  );
  const [rows, setRows] = React.useState<DeckEntry[]>(deck?.entries.length ? deck.entries : [blankRow(), blankRow(), blankRow()]);
  const [saving, setSaving] = React.useState(false);

  const filled = rows.filter((r) => r.word.trim() && r.meaning.trim());

  function setRow(i: number, patch: Partial<DeckEntry>) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }
  function addRow() {
    setRows((prev) => (prev.length >= MAX_ENTRIES ? prev : [...prev, blankRow()]));
  }
  function removeRow(i: number) {
    setRows((prev) => (prev.length <= 1 ? [blankRow()] : prev.filter((_, idx) => idx !== i)));
  }

  function onCsv(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = parseDeckCsv(String(reader.result ?? ""));
      if (parsed.length === 0) {
        void message.error(t("csvEmpty"));
        return;
      }
      setRows((prev) => {
        const existing = prev.filter((r) => r.word.trim() || r.meaning.trim());
        const merged = [...existing, ...parsed].slice(0, MAX_ENTRIES);
        return merged.length ? merged : [blankRow()];
      });
      void message.success(t("csvLoaded", { count: parsed.length }));
    };
    reader.readAsText(file);
  }

  async function submit() {
    if (title.trim().length < 2) {
      void message.error(t("titleRequired"));
      return;
    }
    if (filled.length === 0) {
      void message.error(t("entriesRequired"));
      return;
    }
    setSaving(true);
    const payload = {
      title: title.trim(),
      description: description.trim(),
      classId: classId ?? "",
      entries: filled.map((r) => ({
        word: r.word.trim(),
        ipa: r.ipa.trim(),
        meaning: r.meaning.trim(),
        example: r.example.trim(),
      })),
    };
    const res = mode === "create" ? await createDeck(payload) : await updateDeck(deck!.id, payload);
    setSaving(false);
    if (!res.ok) {
      void message.error(res.error);
      return;
    }
    void message.success(mode === "create" ? t("created") : t("saved"));
    router.push(`/student/decks/${res.deck.id}`);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="font-label-md text-label-md text-on-surface">{t("titleLabel")}</span>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("titlePlaceholder")} maxLength={80} size="large" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="font-label-md text-label-md text-on-surface">{t("descLabel")}</span>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("descPlaceholder")} maxLength={240} size="large" />
        </label>
      </div>

      {ownedClasses.length > 0 ? (
        <label className="flex flex-col gap-1.5">
          <span className="font-label-md text-label-md text-on-surface">{t("classLabel")}</span>
          <Select
            value={classId}
            onChange={(v) => setClassId(v || undefined)}
            allowClear
            size="large"
            placeholder={t("classPlaceholder")}
            options={ownedClasses.map((c) => ({ value: c.id, label: c.name }))}
            style={{ maxWidth: 420 }}
          />
          <span className="font-label-sm text-label-sm text-on-surface-variant">{t("classHint")}</span>
        </label>
      ) : null}

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-label-md text-label-md text-on-surface">
            {t("wordsLabel", { count: filled.length })}
          </span>
          <div className="flex gap-2">
            <Button size="small" icon={<CloudUploadOutlined />} onClick={() => fileRef.current?.click()}>
              {t("importCsv")}
            </Button>
            <Button
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => downloadTextFile("bo-the-mau.csv", `${DECK_CSV_HEADER}\r\ninnovation,/ˌɪnəˈveɪʃn/,sự đổi mới,Innovation drives growth.\r\n`)}
            >
              {t("template")}
            </Button>
            <input ref={fileRef} type="file" accept=".csv,text/csv" hidden onChange={onCsv} />
          </div>
        </div>

        <div className="flex flex-col gap-2 rounded-xl border border-outline-variant/60 p-3">
          <div className="hidden gap-2 px-1 font-label-sm text-label-sm text-on-surface-variant sm:grid sm:grid-cols-[1.2fr_1fr_1.4fr_1.6fr_auto]">
            <span>{t("colWord")}</span>
            <span>{t("colIpa")}</span>
            <span>{t("colMeaning")}</span>
            <span>{t("colExample")}</span>
            <span />
          </div>
          <div className="flex max-h-[26rem] flex-col gap-2 overflow-y-auto pr-1">
            {rows.map((row, i) => (
              <div key={i} className="grid gap-1.5 sm:grid-cols-[1.2fr_1fr_1.4fr_1.6fr_auto] sm:gap-2">
                <Input value={row.word} onChange={(e) => setRow(i, { word: e.target.value })} placeholder={t("colWord")} />
                <Input value={row.ipa} onChange={(e) => setRow(i, { ipa: e.target.value })} placeholder={t("colIpa")} />
                <Input value={row.meaning} onChange={(e) => setRow(i, { meaning: e.target.value })} placeholder={t("colMeaning")} />
                <Input value={row.example} onChange={(e) => setRow(i, { example: e.target.value })} placeholder={t("colExample")} />
                <Button
                  type="text"
                  aria-label={t("removeRow")}
                  icon={<DeleteOutlined />}
                  onClick={() => removeRow(i)}
                  className="justify-self-start text-on-surface-variant sm:justify-self-auto"
                />
              </div>
            ))}
          </div>
          <Button type="dashed" icon={<PlusOutlined />} onClick={addRow} disabled={rows.length >= MAX_ENTRIES} block>
            {t("addRow")}
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="primary" size="large" loading={saving} onClick={() => void submit()}>
          {mode === "create" ? t("submitCreate") : t("submitSave")}
        </Button>
        <Button size="large" onClick={() => router.back()}>
          {t("cancel")}
        </Button>
      </div>
    </div>
  );
}
