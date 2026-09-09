"use client";

import { useTranslations } from "next-intl";
import { Button } from "antd";
import { AppstoreOutlined, ImportOutlined, PlusOutlined, ShareAltOutlined } from "@/components/icons";
import { ImportDeckDialog } from "@/components/features/decks/import-deck-dialog";
import { Link, useRouter } from "@/i18n/navigation";
import type { DeckSummary } from "@/lib/types";

export function DeckList({ decks }: { decks: DeckSummary[] }) {
  const t = useTranslations("dash.decks.list");
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <Button type="primary" icon={<PlusOutlined />} onClick={() => router.push("/student/decks/new")}>
          {t("create")}
        </Button>
        <ImportDeckDialog
          trigger={(open) => (
            <Button icon={<ImportOutlined />} onClick={open}>
              {t("importByCode")}
            </Button>
          )}
        />
      </div>

      {decks.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-outline-variant p-10 text-center">
          <AppstoreOutlined className="text-4xl text-on-surface-variant/60" />
          <p className="font-heading text-headline-sm text-on-surface">{t("emptyTitle")}</p>
          <p className="max-w-sm text-body-sm text-on-surface-variant">{t("emptyBody")}</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {decks.map((deck) => (
            <Link
              key={deck.id}
              href={`/student/decks/${deck.id}`}
              className="flex flex-col gap-2 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-4 transition-colors hover:border-primary/50 hover:bg-primary-container/5"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-heading text-headline-sm text-on-surface">{deck.title}</h3>
                {deck.classId ? (
                  <span className="shrink-0 rounded-full bg-secondary-container/40 px-2 py-0.5 font-label-sm text-[11px] text-secondary">
                    {t("classTag")}
                  </span>
                ) : null}
              </div>
              {deck.description ? (
                <p className="line-clamp-2 text-body-sm text-on-surface-variant">{deck.description}</p>
              ) : null}
              <div className="mt-auto flex items-center gap-3 font-label-sm text-label-sm text-on-surface-variant">
                <span>{t("wordCount", { count: deck.entryCount })}</span>
                <span className="flex items-center gap-1">
                  <ShareAltOutlined /> {deck.shareCode}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
