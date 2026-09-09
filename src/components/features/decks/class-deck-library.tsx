"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { App, Button } from "antd";
import { CheckOutlined, ReadOutlined } from "@/components/icons";
import { importDeck } from "@/lib/actions";
import { useRouter } from "@/i18n/navigation";
import type { DeckSummary } from "@/lib/types";

/**
 * The deck library a teacher published to a class. Each row has an "Add to my
 * review" button — the student picks which decks enter their SRS queue
 * (per the scoping decision: student chooses, not auto-added).
 */
export function ClassDeckLibrary({ decks }: { decks: DeckSummary[] }) {
  const t = useTranslations("dash.decks.classLibrary");
  const { message } = App.useApp();
  const router = useRouter();
  const [addingId, setAddingId] = React.useState<string | null>(null);
  const [done, setDone] = React.useState<Set<string>>(new Set());

  if (decks.length === 0) return null;

  function add(deck: DeckSummary) {
    setAddingId(deck.id);
    void importDeck({ deckId: deck.id }).then((res) => {
      setAddingId(null);
      if (!res.ok) return void message.error(res.error);
      setDone((prev) => new Set(prev).add(deck.id));
      void message.success(
        res.result.cardsAdded > 0 ? t("added", { count: res.result.cardsAdded }) : t("addedNone"),
      );
      router.refresh();
    });
  }

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-4">
      <div>
        <h2 className="flex items-center gap-2 font-heading text-headline-sm text-on-surface">
          <ReadOutlined className="text-primary" /> {t("title")}
        </h2>
        <p className="mt-0.5 text-body-sm text-on-surface-variant">{t("subtitle")}</p>
      </div>

      <ul className="flex flex-col gap-2">
        {decks.map((deck) => {
          const added = done.has(deck.id);
          return (
            <li
              key={deck.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-outline-variant/50 p-3"
            >
              <div className="min-w-0">
                <p className="font-label-md text-label-md text-on-surface">{deck.title}</p>
                <p className="font-label-sm text-label-sm text-on-surface-variant">
                  {t("meta", { count: deck.entryCount, owner: deck.ownerName ?? t("teacher") })}
                </p>
              </div>
              <Button
                size="small"
                type={added ? "default" : "primary"}
                icon={added ? <CheckOutlined /> : <ReadOutlined />}
                loading={addingId === deck.id}
                onClick={() => add(deck)}
              >
                {added ? t("addedBtn") : t("addBtn")}
              </Button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
