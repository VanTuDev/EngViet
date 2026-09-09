"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { App, Button, Input, Select, Upload } from "antd";
import type { UploadProps } from "antd";
import { AimOutlined, CameraOutlined, CheckOutlined, LoadingOutlined } from "@/components/icons";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { LevelBadge } from "@/components/features/gamification/level-badge";
import { updateProfile, uploadAvatar } from "@/lib/actions";
import { highestTitleCode, TITLE_CODES, TITLE_MIN_LEVEL, unlockedTitleCodes } from "@/lib/gamification";
import { useRouter } from "@/i18n/navigation";
import type { ApiUser } from "@/lib/types";

type CustomRequestOptions = Parameters<NonNullable<UploadProps["customRequest"]>>[0];

const BIO_MAX = 200;
const GOAL_MAX = 60;

export function ProfileSettingsForm({ user, roleLabel }: { user: ApiUser; roleLabel: string }) {
  const t = useTranslations("dash.settingsForm");
  const tg = useTranslations("dash.gamification");
  const { message } = App.useApp();
  const router = useRouter();

  const [fullName, setFullName] = useState(user.fullName);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(user.dateOfBirth ? user.dateOfBirth.slice(0, 10) : "");
  const [bio, setBio] = useState(user.bio ?? "");
  const [learningGoal, setLearningGoal] = useState(user.learningGoal ?? "");
  const [displayTitle, setDisplayTitle] = useState(user.title === highestTitleCode(user.level) ? "" : user.title);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

  const isStudent = user.role === "student";
  const nextLockedTitleLevel = TITLE_CODES.map((c) => TITLE_MIN_LEVEL[c]).find((lv) => lv > user.level);
  const titleOptions = useMemo(() => {
    const unlocked = unlockedTitleCodes(user.level);
    return [
      { value: "", label: tg("titleAuto") },
      ...unlocked.map((code) => ({ value: code, label: tg(`titles.${code}`) })),
    ];
  }, [user.level, tg]);

  const dirty =
    fullName !== user.fullName ||
    avatarUrl !== (user.avatarUrl ?? "") ||
    dateOfBirth !== (user.dateOfBirth ? user.dateOfBirth.slice(0, 10) : "") ||
    bio !== (user.bio ?? "") ||
    learningGoal !== (user.learningGoal ?? "") ||
    displayTitle !== (user.title === highestTitleCode(user.level) ? "" : user.title);

  async function handleAvatar(options: CustomRequestOptions) {
    const file = options.file as File;
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    const res = await uploadAvatar(form);
    setUploading(false);
    if (res.ok) {
      setAvatarUrl(res.url);
      setStatus("idle");
      options.onSuccess?.(res);
    } else {
      void message.error(res.error);
      options.onError?.(new Error(res.error));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!dirty || status === "saving") return;
    setStatus("saving");
    const res = await updateProfile({
      fullName,
      avatarUrl: avatarUrl || null,
      dateOfBirth: dateOfBirth || null,
      bio: bio || null,
      learningGoal: learningGoal || null,
      displayTitle,
    });
    if (res.ok) {
      setStatus("saved");
      router.refresh();
    } else {
      setStatus("idle");
      void message.error(res.error ?? t("saveError"));
    }
  }

  return (
    <Card className="max-w-2xl p-6">
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <Avatar name={fullName} src={avatarUrl || undefined} size="lg" />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-heading text-headline-sm text-on-surface">{fullName}</p>
            {isStudent ? <LevelBadge level={user.level} title={user.title} /> : null}
          </div>
          <p className="text-body-sm text-on-surface-variant">{roleLabel}</p>
        </div>
        <Upload
          accept="image/png,image/jpeg,image/webp,image/gif"
          showUploadList={false}
          customRequest={(options) => void handleAvatar(options)}
          className="ml-auto"
        >
          <Button icon={uploading ? <LoadingOutlined spin /> : <CameraOutlined />} disabled={uploading}>
            {avatarUrl ? t("changePhoto") : t("addPhoto")}
          </Button>
        </Upload>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label={t("nameLabel")}>
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={100} size="large" />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={t("dobLabel")} hint={t("dobHint")}>
            <input
              type="date"
              value={dateOfBirth}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="h-10 w-full rounded-lg border border-outline-variant bg-surface px-3 text-body-md text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </Field>
          <Field label={t("goalLabel")}>
            <Input
              value={learningGoal}
              onChange={(e) => setLearningGoal(e.target.value)}
              maxLength={GOAL_MAX}
              size="large"
              placeholder={t("goalPlaceholder")}
              prefix={<AimOutlined className="text-on-surface-variant" />}
            />
          </Field>
        </div>

        <Field label={t("bioLabel")} hint={`${bio.length}/${BIO_MAX}`}>
          <Input.TextArea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={BIO_MAX}
            autoSize={{ minRows: 2, maxRows: 4 }}
            placeholder={t("bioPlaceholder")}
          />
        </Field>

        {isStudent ? (
          <Field label={tg("titleLabel")} hint={tg("titleHint")}>
            <Select
              value={displayTitle}
              onChange={setDisplayTitle}
              options={titleOptions}
              size="large"
              className="w-full sm:max-w-xs"
            />
          </Field>
        ) : null}

        <Field label={t("emailLabel")}>
          <Input value={user.email} disabled readOnly size="large" />
        </Field>

        {isStudent && nextLockedTitleLevel ? (
          <p className="font-label-sm text-label-sm text-on-surface-variant">
            {tg("nextTitleHint", { level: nextLockedTitleLevel })}
          </p>
        ) : null}

        <div className="mt-2 flex items-center gap-3">
          <Button type="primary" htmlType="submit" size="large" loading={status === "saving"} disabled={!dirty}>
            {t("saveChanges")}
          </Button>
          {status === "saved" && !dirty ? (
            <span className="flex items-center gap-1 font-label-sm text-label-sm text-secondary">
              <CheckOutlined /> {t("saved")}
            </span>
          ) : null}
        </div>
      </form>
    </Card>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-baseline justify-between font-label-sm text-label-sm text-on-surface-variant">
        <span>{label}</span>
        {hint ? <span className="text-on-surface-variant/70">{hint}</span> : null}
      </span>
      {children}
    </label>
  );
}
