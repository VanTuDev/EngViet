import { useTranslations } from "next-intl";
import { CheckOutlined, CloseOutlined } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import { cn, formatCurrencyVND } from "@/lib/utils";
import type { Plan } from "@/lib/types";

export function PlanCard({
  plan,
  selected,
  ctaHref,
}: {
  plan: Plan;
  selected?: boolean;
  ctaHref?: string;
}) {
  const t = useTranslations("common");

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-xl border p-6 transition-shadow",
        plan.highlighted
          ? "border-2 border-primary bg-primary-fixed shadow-md ring-4 ring-primary-container/20"
          : "border-outline-variant bg-surface-container-lowest hover:shadow-md",
      )}
    >
      {plan.highlighted ? (
        <Badge variant="primary" className="absolute -top-3 right-4 bg-primary text-on-primary shadow-sm">
          {t("popular")}
        </Badge>
      ) : null}
      {selected ? (
        <Badge variant="success" className="absolute -top-3 left-4">
          {t("selected")}
        </Badge>
      ) : null}

      <div className={cn("font-heading text-headline-md", plan.highlighted ? "text-primary" : "text-on-surface")}>{plan.name}</div>
      <p className={cn("mt-1 text-body-sm", plan.highlighted ? "text-primary/80" : "text-on-surface-variant")}>{plan.tagline}</p>

      <div className="mb-6 mt-4 font-heading text-headline-lg text-on-surface">
        {plan.priceMonthly === null ? t("custom") : plan.priceMonthly === 0 ? "0đ" : formatCurrencyVND(plan.priceMonthly)}
        {plan.priceMonthly ? <span className="font-body-sm text-body-sm text-on-surface-variant">{t("perMonth")}</span> : null}
      </div>

      <ul className="flex flex-1 flex-col gap-3 text-body-sm text-on-surface-variant">
        {plan.features.map((feature) => (
          <li key={feature.label} className={cn("flex items-start gap-2", !feature.included && "text-outline")}>
            {feature.included ? (
              <CheckOutlined className="mt-0.5 shrink-0 text-lg text-secondary" aria-hidden="true" />
            ) : (
              <CloseOutlined className="mt-0.5 shrink-0 text-lg" aria-hidden="true" />
            )}
            {feature.label}
          </li>
        ))}
      </ul>

      {ctaHref ? (
        <Button asChild variant={plan.highlighted ? "primary" : "outline"} className="mt-6 w-full">
          <Link href={ctaHref}>{plan.priceMonthly === null ? t("contactUs") : t("choosePlan")}</Link>
        </Button>
      ) : null}
    </div>
  );
}
