"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { App, Button, Input, Modal } from "antd";
import { CheckCircleOutlined, ImportOutlined, SearchOutlined } from "@/components/icons";
import { importDeck, lookupDeck } from "@/lib/actions";
import { useRouter } from "@/i18n/navigation";
import type { DeckPreview } from "@/lib/types";

/**
 * Enter a 6-char share code → preview the deck → add its words to your review.
 * `trigger` lets the caller style the opener (a button, a menu item…).
 */
export function ImportDeckDialog({ trigger }: { trigger: (open: () => void) => React.ReactNode }) {
  const t = useTranslations("dash.decks.import");
  const { message } = App.useApp();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [preview, setPreview] = useState<DeckPreview | null>(null);
  const [looking, setLooking] = useState(false);
  const [importing, startImport] = useTransition();

  function reset() {
    setCode("");
    setPreview(null);
    setLooking(false);
  }

  async function lookup() {
    const c = code.trim();
    if (c.length < 4) return;
    setLooking(true);
    setPreview(null);
    const found = await lookupDeck(c);
    setLooking(false);
    if (!found) {
      void message.error(t("notFound"));
      return;
    }
    setPreview(found);
  }

  function doImport() {
    if (!preview) return;
    startImport(async () => {
      const res = await importDeck({ shareCode: preview.shareCode });
      if (!res.ok) {
        void message.error(res.error);
        return;
      }
      void message.success(
        res.result.cardsAdded > 0
          ? t("added", { count: res.result.cardsAdded })
          : t("addedNone"),
      );
      setOpen(false);
      setTimeout(reset, 200);
      router.refresh();
    });
  }

  return (
    <>
      {trigger(() => setOpen(true))}
      <Modal
        open={open}
        onCancel={() => {
          setOpen(false);
          setTimeout(reset, 200);
        }}
        footer={null}
        title={t("title")}
        centered
        width={420}
        destroyOnHidden
      >
        <p className="mb-3 text-body-sm text-on-surface-variant">{t("hint")}</p>
        <div className="flex gap-2">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onPressEnter={() => void lookup()}
            placeholder={t("placeholder")}
            maxLength={12}
            size="large"
            autoFocus
            style={{ letterSpacing: "0.15em", fontWeight: 600 }}
          />
          <Button size="large" icon={<SearchOutlined />} loading={looking} onClick={() => void lookup()}>
            {t("find")}
          </Button>
        </div>

        {preview ? (
          <div className="mt-4 rounded-xl border border-outline-variant/60 bg-surface-container-low p-4">
            <p className="font-heading text-headline-sm text-on-surface">{preview.title}</p>
            {preview.description ? (
              <p className="mt-0.5 text-body-sm text-on-surface-variant">{preview.description}</p>
            ) : null}
            <p className="mt-1 font-label-sm text-label-sm text-on-surface-variant">
              {t("meta", { count: preview.entryCount, owner: preview.ownerName ?? t("someone") })}
            </p>
            {preview.sampleWords.length > 0 ? (
              <p className="mt-2 flex flex-wrap gap-1.5">
                {preview.sampleWords.map((w) => (
                  <span key={w} className="rounded-full bg-surface-variant px-2 py-0.5 font-label-sm text-[11px] text-on-surface-variant">
                    {w}
                  </span>
                ))}
              </p>
            ) : null}
            <Button
              type="primary"
              size="large"
              block
              icon={preview.alreadyMine ? <CheckCircleOutlined /> : <ImportOutlined />}
              loading={importing}
              onClick={doImport}
              style={{ marginTop: 14 }}
            >
              {preview.alreadyMine ? t("reimport") : t("add")}
            </Button>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
