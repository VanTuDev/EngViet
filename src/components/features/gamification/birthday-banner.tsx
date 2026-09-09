"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { App } from "antd";
import { GiftOutlined } from "@/components/icons";
import { Confetti } from "@/components/motion/confetti";
import { claimBirthdayGift } from "@/lib/actions";
import { useRouter } from "@/i18n/navigation";

function isBirthdayToday(dateOfBirth: string): boolean {
  const dob = new Date(dateOfBirth);
  const now = new Date();
  return dob.getMonth() === now.getMonth() && dob.getDate() === now.getDate();
}

/** Shows on the student's birthday only — a one-tap XP gift, claimable once a year. */
export function BirthdayBanner({ dateOfBirth }: { dateOfBirth?: string }) {
  const t = useTranslations("dash.gamification.birthday");
  const { message } = App.useApp();
  const router = useRouter();
  const [claimed, setClaimed] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!dateOfBirth || !isBirthdayToday(dateOfBirth)) return null;

  async function claim() {
    setBusy(true);
    const res = await claimBirthdayGift();
    setBusy(false);
    if (res.granted) {
      setClaimed(true);
      void message.success(t("claimed", { xp: res.xp }));
      router.refresh();
    } else {
      setClaimed(true); // already claimed this year
      void message.info(t("already"));
    }
  }

  return (
    <div className="relative flex flex-col items-start gap-2 overflow-hidden rounded-xl border border-tertiary/40 bg-tertiary/5 p-5 sm:flex-row sm:items-center sm:justify-between">
      <Confetti seedKey="birthday" count={60} />
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-tertiary/15 text-xl text-tertiary">
          <GiftOutlined />
        </span>
        <div>
          <p className="font-heading text-headline-sm text-on-surface">{t("title")}</p>
          <p className="text-body-sm text-on-surface-variant">{t("desc")}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => void claim()}
        disabled={busy || claimed}
        className="shrink-0 rounded-lg bg-tertiary px-4 py-2 font-label-md text-label-md text-on-tertiary transition-colors hover:bg-tertiary/90 disabled:opacity-50"
      >
        {claimed ? t("done") : t("claim")}
      </button>
    </div>
  );
}
