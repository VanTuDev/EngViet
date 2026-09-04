"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import QRCode from "react-qr-code";
import { CheckOutlined, CopyOutlined } from "@/components/icons";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * Renders a real, scannable VietQR-style payment code. Loaded via
 * `next/dynamic` from the billing page since it's only needed once a
 * teacher actually reaches checkout, keeping it out of the initial bundle.
 */
export function QrCheckout({ reference, amount }: { reference: string; amount: number }) {
  const t = useTranslations("dash.checkout");
  const [copied, setCopied] = useState(false);
  const payload = `TOPTI|REF:${reference}|AMOUNT:${amount}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (unsupported browser / permissions) — no-op.
    }
  }

  return (
    <Card className="p-6 text-center">
      <CardHeader className="p-0 pb-2">
        <CardTitle className="text-headline-sm">{t("title")}</CardTitle>
        <CardDescription>{t("desc")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 p-0 pt-4">
        <div className="inline-block rounded-xl border border-outline-variant bg-surface p-4">
          <QRCode value={payload} size={176} fgColor="#0b1c30" bgColor="transparent" aria-label={t("qrAria")} />
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex w-full items-center justify-between gap-2 rounded-lg bg-surface-container p-3 text-left font-body-sm text-body-sm text-on-surface-variant transition-colors hover:bg-surface-container-high"
        >
          <span className="truncate">{t("reference", { ref: reference })}</span>
          {copied ? (
            <Badge variant="success" className="shrink-0 gap-1">
              <CheckOutlined /> {t("copied")}
            </Badge>
          ) : (
            <span className="flex shrink-0 items-center gap-1 font-label-md text-label-md text-primary">
              <CopyOutlined /> {t("copy")}
            </span>
          )}
        </button>
      </CardContent>
    </Card>
  );
}
