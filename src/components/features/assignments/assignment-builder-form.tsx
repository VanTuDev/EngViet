"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircleOutlined, CheckSquareOutlined, LoadingOutlined, BlockOutlined, RocketOutlined } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExcelUploader } from "@/components/features/assignments/excel-uploader";
import { generateMatchingBoard, generateQuizFromVocabulary } from "@/lib/generators";
import { createAssignment } from "@/lib/actions";
import { useRouter } from "@/i18n/navigation";
import type { AssignmentMode, VocabularyItem } from "@/lib/types";

export interface ClassOption {
  id: string;
  name: string;
}

export function AssignmentBuilderForm({ classes }: { classes: ClassOption[] }) {
  const t = useTranslations("dash.builder");
  const locale = useLocale();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [classId, setClassId] = useState(classes[0]?.id ?? "");
  const [mode, setMode] = useState<AssignmentMode>("matching");
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
  const [durationSeconds, setDurationSeconds] = useState(60);
  const [deadline, setDeadline] = useState(() => {
    const d = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    return d.toISOString().slice(0, 16);
  });
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const quizPreview = useMemo(
    () => (mode === "quiz" ? generateQuizFromVocabulary(vocabulary, { seedKey: title || "preview" }) : []),
    [mode, vocabulary, title],
  );
  const matchingPreview = useMemo(
    () => (mode === "matching" ? generateMatchingBoard(vocabulary, { seedKey: title || "preview", pairCount: 6 }) : null),
    [mode, vocabulary, title],
  );

  const canPublish = title.trim().length > 0 && classId && vocabulary.length >= 4;

  async function handlePublish(e: React.FormEvent) {
    e.preventDefault();
    if (!canPublish || publishing) return;
    setPublishing(true);
    setError(null);
    const res = await createAssignment({
      classId,
      title,
      mode,
      vocabulary: vocabulary.map((v) => ({ word: v.word, ipa: v.ipa, meaning: v.meaning, example: v.example })),
      durationSeconds,
      deadline: new Date(deadline).toISOString(),
      ...(mode === "quiz" ? { questionCount: Math.min(vocabulary.length, 15) } : {}),
    });
    setPublishing(false);
    if (res.ok) {
      setPublished(true);
      router.refresh();
    } else {
      setError(res.error);
    }
  }

  if (published) {
    return (
      <Card className="flex flex-col items-center gap-4 p-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary-container/40 text-3xl text-secondary">
          <CheckCircleOutlined />
        </div>
        <div>
          <h3 className="font-heading text-headline-md text-on-surface">{t("publishedTitle")}</h3>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            {t("publishedBody", { title, deadline: new Date(deadline).toLocaleString(locale === "vi" ? "vi-VN" : "en-US") })}
          </p>
        </div>
        <Button onClick={() => setPublished(false)} variant="secondary">
          {t("createAnother")}
        </Button>
      </Card>
    );
  }

  return (
    <form onSubmit={(e) => void handlePublish(e)} className="grid grid-cols-1 gap-gutter lg:grid-cols-12">
      <div className="flex flex-col gap-gutter lg:col-span-7">
        <Card>
          <CardHeader>
            <CardTitle className="text-headline-sm">{t("step1")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ExcelUploader onParsed={setVocabulary} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-headline-sm">{t("step2")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={mode} value={mode} onValueChange={(v) => setMode(v as AssignmentMode)}>
              <TabsList>
                <TabsTrigger value="matching">
                  <BlockOutlined className="mr-1.5" /> {t("matchingTab")}
                </TabsTrigger>
                <TabsTrigger value="quiz">
                  <CheckSquareOutlined className="mr-1.5" /> {t("quizTab")}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="matching" className="mt-4">
                <p className="text-body-sm text-on-surface-variant">{t("matchingHint")}</p>
                {matchingPreview ? (
                  <p className="mt-3 font-label-sm text-label-sm text-primary">
                    {t("matchingPreview", { count: matchingPreview.words.length })}
                  </p>
                ) : null}
              </TabsContent>
              <TabsContent value="quiz" className="mt-4">
                <p className="text-body-sm text-on-surface-variant">{t("quizHint")}</p>
                {quizPreview.length > 0 ? (
                  <p className="mt-3 font-label-sm text-label-sm text-primary">{t("quizPreview", { count: quizPreview.length })}</p>
                ) : null}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-gutter lg:col-span-5">
        <Card>
          <CardHeader>
            <CardTitle className="text-headline-sm">{t("step3")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="assignment-title">{t("titleLabel")}</Label>
              <Input id="assignment-title" required placeholder={t("titlePlaceholder")} value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="assignment-class">{t("classLabel")}</Label>
              <Select id="assignment-class" className="w-full" value={classId} onChange={(e) => setClassId(e.target.value)}>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="assignment-duration">{t("durationLabel")}</Label>
              <Input
                id="assignment-duration"
                type="number"
                min={30}
                step={30}
                value={durationSeconds}
                onChange={(e) => setDurationSeconds(Number(e.target.value))}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="assignment-deadline">{t("deadlineLabel")}</Label>
              <Input id="assignment-deadline" type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>

            <Button type="submit" size="lg" disabled={!canPublish || publishing} className="mt-2 w-full">
              {publishing ? <LoadingOutlined spin /> : <RocketOutlined />}
              {t("publish")}
            </Button>
            {!canPublish ? (
              <p className="text-center font-label-sm text-label-sm text-on-surface-variant">{t("cannotPublish")}</p>
            ) : null}
            {error ? <p className="text-center font-label-sm text-label-sm text-error">{error}</p> : null}
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
