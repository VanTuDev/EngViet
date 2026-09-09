import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { TrophyOutlined } from "@/components/icons";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeaderboardTable } from "@/components/features/leaderboard/leaderboard-table";
import { buildPrivateMetadata } from "@/lib/seo";
import { getMyClasses } from "@/lib/api/classes";
import { getClassLeaderboard } from "@/lib/api/leaderboard";
import { getCurrentUser } from "@/lib/api/session";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dash.student.leaderboard");
  return buildPrivateMetadata(t("meta"));
}

export default async function StudentLeaderboardPage() {
  const t = await getTranslations("dash.student.leaderboard");
  const tc = await getTranslations("dash.common");
  const [myClasses, user] = await Promise.all([getMyClasses("enrolled"), getCurrentUser()]);
  const leaderboards = await Promise.all(myClasses.map((c) => getClassLeaderboard(c.id)));

  if (myClasses.length === 0) {
    return (
      <>
        <PageHeader title={t("title")} description={t("desc")} />
        <EmptyState icon={TrophyOutlined} title={t("emptyTitle")} description={t("emptyDesc")} />
      </>
    );
  }

  const firstClassId = myClasses[0]!.id;

  return (
    <>
      <PageHeader title={t("title")} description={t("desc")} />

      <Tabs defaultValue={firstClassId}>
        <TabsList>
          {myClasses.map((classRoom) => (
            <TabsTrigger key={classRoom.id} value={classRoom.id}>
              {classRoom.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {myClasses.map((classRoom, index) => (
          <TabsContent key={classRoom.id} value={classRoom.id} className="mt-4">
            <Card className="p-6">
              <LeaderboardTable
                entries={leaderboards[index] ?? []}
                highlightStudentId={user?.id}
                scoreLabel={tc("xp")}
                showTime={false}
                showLevel
              />
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </>
  );
}
