"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { CheckOutlined, LoadingOutlined } from "@/components/icons";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { updateProfile } from "@/lib/actions";
import { useRouter } from "@/i18n/navigation";

export function ProfileSettingsForm({
  name,
  email,
  roleLabel,
}: {
  name: string;
  email: string;
  roleLabel: string;
}) {
  const t = useTranslations("dash.settingsForm");
  const router = useRouter();
  const [fullName, setFullName] = useState(name);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    startTransition(async () => {
      await updateProfile({ fullName });
      setStatus("saved");
      router.refresh();
    });
  }

  return (
    <Card className="max-w-xl p-6">
      <div className="mb-6 flex items-center gap-4">
        <Avatar name={fullName} size="lg" />
        <div>
          <p className="font-heading text-headline-sm text-on-surface">{fullName}</p>
          <p className="text-body-sm text-on-surface-variant">{roleLabel}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="settings-name">{t("nameLabel")}</Label>
          <Input
            id="settings-name"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              setStatus("idle");
            }}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="settings-email">{t("emailLabel")}</Label>
          <Input id="settings-email" type="email" value={email} disabled readOnly />
        </div>
        <div className="mt-2 flex items-center gap-3">
          <Button type="submit" disabled={status === "saving"}>
            {status === "saving" ? <LoadingOutlined spin /> : null}
            {t("saveChanges")}
          </Button>
          {status === "saved" ? (
            <span className="flex items-center gap-1 font-label-sm text-label-sm text-secondary">
              <CheckOutlined /> {t("saved")}
            </span>
          ) : null}
        </div>
      </form>
    </Card>
  );
}
