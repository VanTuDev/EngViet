import { getFormatter, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { cn, hoursUntil } from "@/lib/utils";

/**
 * Một dòng "hạn chót sắp tới" trong dashboard học sinh.
 * Là Server Component async: `Date.now()` chạy ở server (không vướng quy tắc
 * purity của React như trong Client Component), chữ lấy qua `getTranslations`.
 */
export async function DeadlineItem({
  href,
  title,
  classLabel,
  detail,
  deadline,
}: {
  href: string;
  title: string;
  classLabel: string;
  detail: string;
  deadline: string;
}) {
  const t = await getTranslations("dash.deadlineItem");
  const format = await getFormatter();

  const diffHours = hoursUntil(deadline);
  let label: string;
  let urgent = false;
  if (diffHours <= 0) {
    label = t("expired");
    urgent = true;
  } else if (diffHours < 6) {
    label = t("hoursLeft", { count: Math.round(diffHours) });
    urgent = true;
  } else if (diffHours < 24) {
    label = t("today");
    urgent = true;
  } else if (diffHours < 48) {
    label = t("tomorrow");
  } else {
    label = format.dateTime(new Date(deadline), { day: "2-digit", month: "short" });
  }

  return (
    <Link
      href={href}
      className={cn(
        "relative block overflow-hidden rounded-lg border p-4 transition-colors",
        urgent ? "border-error-container bg-error-container/30" : "border-outline-variant bg-surface hover:border-primary/30",
      )}
    >
      <div className={cn("absolute left-0 top-0 h-full w-1", urgent ? "bg-error" : "bg-surface-variant")} />
      <div className="pl-2">
        <div className="mb-2 flex items-start justify-between gap-2">
          <span
            className={cn(
              "rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
              urgent ? "bg-error text-on-error" : "bg-surface-variant text-on-surface-variant",
            )}
          >
            {label}
          </span>
          <span className="font-label-sm text-label-sm text-on-surface-variant">{classLabel}</span>
        </div>
        <h4 className="mb-1 font-label-md text-label-md text-on-surface">{title}</h4>
        <p className="text-body-sm text-on-surface-variant">{detail}</p>
      </div>
    </Link>
  );
}
