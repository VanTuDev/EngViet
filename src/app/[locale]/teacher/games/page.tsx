import type { Metadata } from "next";
import { getFormatter, getTranslations } from "next-intl/server";
import { Button, Card, Empty } from "antd";
import { PlusOutlined, ThunderboltOutlined } from "@/components/icons";
import { PageHeader } from "@/components/layout/page-header";
import { QuizSetRowActions } from "@/components/features/games/quiz-set-row-actions";
import { buildPrivateMetadata } from "@/lib/seo";
import { getMyQuizSets } from "@/lib/api/games";
import { Link } from "@/i18n/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dash.games.list");
  return buildPrivateMetadata(t("meta"));
}

export default async function TeacherGamesPage() {
  const t = await getTranslations("dash.games.list");
  const format = await getFormatter();
  const quizSets = await getMyQuizSets();

  return (
    <>
      <PageHeader
        title={t("title")}
        description={t("desc")}
        actions={
          <Link href="/teacher/games/new">
            <Button type="primary" icon={<PlusOutlined />}>
              {t("newQuizSet")}
            </Button>
          </Link>
        }
      />

      {quizSets.length === 0 ? (
        <Card>
          <Empty description={t("emptyDesc")}>
            <Link href="/teacher/games/new">
              <Button type="primary" icon={<PlusOutlined />}>
                {t("newQuizSet")}
              </Button>
            </Link>
          </Empty>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-3">
          {quizSets.map((quizSet) => (
            <Card key={quizSet.id}>
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-tertiary-container/30 text-xl text-tertiary">
                  <ThunderboltOutlined />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-heading text-headline-sm text-on-surface">{quizSet.title}</h3>
                  <p className="mt-0.5 font-label-sm text-label-sm text-on-surface-variant">
                    {t("questionCount", { count: quizSet.questionCount })} ·{" "}
                    {format.dateTime(new Date(quizSet.createdAt), { day: "2-digit", month: "2-digit", year: "numeric" })}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <QuizSetRowActions quizSetId={quizSet.id} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
