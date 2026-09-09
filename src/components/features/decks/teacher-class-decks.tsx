"use client";

import { useTranslations } from "next-intl";
import { Button } from "antd";
import { AppstoreOutlined, EditOutlined, PlusOutlined, ShareAltOutlined } from "@/components/icons";
import { Link, useRouter } from "@/i18n/navigation";
import type { DeckSummary } from "@/lib/types";

/**
 * "Bộ thẻ của lớp" on the teacher vocabulary page — decks this teacher published
 * to the selected class. Create/edit reuse the shared deck pages under
 * `/student/decks` (decks aren't role-locked); the proxy lets a teacher in there.
 */
export function TeacherClassDecks({ classId, decks }: { classId: string; decks: DeckSummary[] }) {
  const t = useTranslations("dash.decks.teacherSection");
  const router = useRouter();
  const mine = decks.filter((d) => d.mine);

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="flex items-center gap-2 font-heading text-headline-sm text-on-surface">
            <AppstoreOutlined className="text-primary" /> {t("title")}
          </h2>
          <p className="mt-0.5 text-body-sm text-on-surface-variant">{t("subtitle")}</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => router.push(`/student/decks/new?classId=${classId}`)}
        >
          {t("create")}
        </Button>
      </div>

      {mine.length === 0 ? (
        <p className="rounded-xl border border-dashed border-outline-variant p-6 text-center text-body-sm text-on-surface-variant">
          {t("empty")}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {mine.map((deck) => (
            <li
              key={deck.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-outline-variant/50 p-3"
            >
              <div className="min-w-0">
                <Link href={`/student/decks/${deck.id}`} className="font-label-md text-label-md text-on-surface hover:text-primary hover:underline">
                  {deck.title}
                </Link>
                <p className="flex items-center gap-3 font-label-sm text-label-sm text-on-surface-variant">
                  <span>{t("wordCount", { count: deck.entryCount })}</span>
                  <span className="flex items-center gap-1">
                    <ShareAltOutlined /> {deck.shareCode}
                  </span>
                  {deck.importCount > 0 ? <span>{t("imports", { count: deck.importCount })}</span> : null}
                </p>
              </div>
              <Button size="small" icon={<EditOutlined />} onClick={() => router.push(`/student/decks/${deck.id}/edit`)}>
                {t("edit")}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
