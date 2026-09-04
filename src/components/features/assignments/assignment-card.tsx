import { getFormatter, getTranslations } from "next-intl/server";
import { ClockCircleOutlined, CheckSquareOutlined, BlockOutlined } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import type { Assignment } from "@/lib/types";

export async function AssignmentCard({
  assignment,
  classLabel,
  href,
}: {
  assignment: Assignment;
  classLabel: string;
  href: string;
}) {
  const t = await getTranslations("dash.common");
  const format = await getFormatter();
  const isQuiz = assignment.mode === "quiz";
  const itemCount = isQuiz ? assignment.questions.length : assignment.vocabulary.length;

  return (
    <Link
      href={href}
      className="flex flex-col gap-3 rounded-lg border border-outline-variant bg-surface-container-lowest p-5 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-4">
        <div className={cardIconClasses(isQuiz)}>{isQuiz ? <CheckSquareOutlined /> : <BlockOutlined />}</div>
        <div>
          <h4 className="font-label-md text-label-md text-on-surface">{assignment.title}</h4>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            {classLabel} · {itemCount} {isQuiz ? t("questions") : t("words")}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-2">
        <Badge variant={isQuiz ? "primary" : "success"}>{isQuiz ? t("quiz") : t("matching")}</Badge>
        <span className="flex items-center gap-1 whitespace-nowrap font-label-sm text-label-sm text-on-surface-variant">
          <ClockCircleOutlined /> {format.dateTime(new Date(assignment.deadline), { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </Link>
  );
}

function cardIconClasses(isQuiz: boolean) {
  return `flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl ${
    isQuiz ? "bg-primary-container/15 text-primary" : "bg-secondary-container/30 text-secondary"
  }`;
}
