import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Alert } from "antd";
import { InfoCircleOutlined } from "@/components/icons";
import { PageHeader } from "@/components/layout/page-header";
import { AssignmentCard } from "@/components/features/assignments/assignment-card";
import { ScheduleCalendar, type ScheduleDayItem } from "@/components/features/schedule/schedule-calendar";
import { ScheduleWeekNav } from "@/components/features/schedule/schedule-week-nav";
import { buildPrivateMetadata } from "@/lib/seo";
import { getMyClasses } from "@/lib/api/classes";
import { getAssignmentsInRange } from "@/lib/api/assignments";
import { buildScheduleRange, groupAssignmentsByDay, parseWeekOffset } from "@/lib/schedule";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dash.schedule");
  return buildPrivateMetadata(t("meta"));
}

export default async function TeacherSchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ offset?: string }>;
}) {
  const t = await getTranslations("dash.schedule");
  const { offset } = await searchParams;
  const { from, to, days, weekOffset } = buildScheduleRange(parseWeekOffset(offset));

  const [classes, assignments] = await Promise.all([
    getMyClasses("owned"),
    getAssignmentsInRange(from.toISOString(), to.toISOString(), "owned"),
  ]);
  const classNameById = new Map(classes.map((c) => [c.id, c.name]));
  const byDay = groupAssignmentsByDay(assignments);

  const dayItems: ScheduleDayItem[] = days.map((day) => {
    const items = byDay.get(day.dateKey) ?? [];
    return {
      dateKey: day.dateKey,
      date: day.date,
      isToday: day.isToday,
      count: items.length,
      items: items.map((a) => ({ id: a.id, title: a.title, mode: a.mode })),
      node: (
        <div className="flex flex-col gap-3">
          {items.map((assignment) => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
              classLabel={classNameById.get(assignment.classId) ?? ""}
              href={`/teacher/assignments/${assignment.id}`}
            />
          ))}
        </div>
      ),
    };
  });

  return (
    <>
      <PageHeader title={t("title")} description={t("teacherDesc")} />
      <Alert type="info" showIcon icon={<InfoCircleOutlined />} message={t("hint")} className="!items-center" />
      <ScheduleWeekNav from={from} to={to} weekOffset={weekOffset} basePath="/teacher/schedule" />
      <ScheduleCalendar days={dayItems} />
    </>
  );
}
