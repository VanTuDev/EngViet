"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { App, Button, Popconfirm, Segmented } from "antd";
import {
  CopyOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  ReadOutlined,
  ShareAltOutlined,
  TableOutlined,
} from "@/components/icons";
import { DeckStudy } from "@/components/features/srs/deck-study";
import { deleteDeck, importDeck } from "@/lib/actions";
import { deckEntriesToCsv } from "@/lib/deck-csv";
import { downloadTextFile } from "@/lib/download";
import { Link, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { VocabDeck } from "@/lib/types";

export function DeckDetailView({ deck, canEdit }: { deck: VocabDeck; canEdit: boolean }) {
  const t = useTranslations("dash.decks.detail");
  const { message } = App.useApp();
  const router = useRouter();
  const [tab, setTab] = React.useState<"list" | "study">("list");
  const [busy, setBusy] = React.useState(false);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(deck.shareCode);
      void message.success(t("codeCopied"));
    } catch {
      void message.info(deck.shareCode);
    }
  }

  function exportCsv() {
    const safe = deck.title.replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "").toLowerCase() || "bo-the";
    downloadTextFile(`${safe}.csv`, deckEntriesToCsv(deck.entries));
  }

  function addToReview() {
    setBusy(true);
    void importDeck({ deckId: deck.id }).then((res) => {
      setBusy(false);
      if (!res.ok) return void message.error(res.error);
      void message.success(
        res.result.cardsAdded > 0 ? t("addedToReview", { count: res.result.cardsAdded }) : t("addedNone"),
      );
      router.refresh();
    });
  }

  function remove() {
    setBusy(true);
    void deleteDeck(deck.id).then((res) => {
      setBusy(false);
      if (!res.ok) return void message.error(res.error);
      void message.success(t("deleted"));
      router.push("/student/decks");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-heading text-headline-lg text-on-surface">{deck.title}</h1>
          {deck.description ? <p className="mt-1 text-body-md text-on-surface-variant">{deck.description}</p> : null}
          <p className="mt-1 font-label-sm text-label-sm text-on-surface-variant">
            {t("meta", { count: deck.entryCount })}
            {deck.className ? ` · ${t("inClass", { name: deck.className })}` : ""}
            {deck.importCount > 0 ? ` · ${t("imports", { count: deck.importCount })}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button icon={<ReadOutlined />} loading={busy} onClick={addToReview}>
            {t("addToReview")}
          </Button>
          <Button icon={<DownloadOutlined />} onClick={exportCsv}>
            {t("exportCsv")}
          </Button>
          {canEdit ? (
            <>
              <Button icon={<EditOutlined />} onClick={() => router.push(`/student/decks/${deck.id}/edit`)}>
                {t("edit")}
              </Button>
              <Popconfirm title={t("deleteConfirm")} okText={t("deleteOk")} cancelText={t("deleteCancel")} onConfirm={remove}>
                <Button danger icon={<DeleteOutlined />}>
                  {t("delete")}
                </Button>
              </Popconfirm>
            </>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-outline-variant/60 bg-surface-container-low p-3">
        <span className="flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant">
          <ShareAltOutlined /> {t("shareLabel")}
        </span>
        <code className="rounded-md bg-surface px-2.5 py-1 font-heading text-headline-sm tracking-[0.2em] text-primary">
          {deck.shareCode}
        </code>
        <Button size="small" icon={<CopyOutlined />} onClick={() => void copyCode()}>
          {t("copy")}
        </Button>
        <span className="font-label-sm text-label-sm text-on-surface-variant">{t("shareHint")}</span>
      </div>

      <Segmented
        value={tab}
        onChange={(v) => setTab(v as "list" | "study")}
        options={[
          { value: "list", label: <span className="flex items-center gap-1.5"><TableOutlined /> {t("tabList")}</span> },
          { value: "study", label: <span className="flex items-center gap-1.5"><ReadOutlined /> {t("tabStudy")}</span> },
        ]}
      />

      {tab === "study" ? (
        <DeckStudy entries={deck.entries} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-outline-variant/60">
          <table className="w-full min-w-[36rem] text-left text-body-sm">
            <thead className="bg-surface-container-low font-label-sm text-label-sm text-on-surface-variant">
              <tr>
                <th className="px-3 py-2">{t("colWord")}</th>
                <th className="px-3 py-2">{t("colIpa")}</th>
                <th className="px-3 py-2">{t("colMeaning")}</th>
                <th className="px-3 py-2">{t("colExample")}</th>
              </tr>
            </thead>
            <tbody>
              {deck.entries.map((e, i) => (
                <tr key={i} className={cn("border-t border-outline-variant/40", i % 2 ? "bg-surface-container-lowest" : undefined)}>
                  <td className="px-3 py-2 font-label-md text-label-md text-on-surface">{e.word}</td>
                  <td className="px-3 py-2 text-on-surface-variant">{e.ipa}</td>
                  <td className="px-3 py-2 text-on-surface">{e.meaning}</td>
                  <td className="px-3 py-2 text-on-surface-variant">{e.example}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Link href="/student/decks" className="font-label-md text-label-md text-primary hover:underline">
        ← {t("backToDecks")}
      </Link>
    </div>
  );
}
