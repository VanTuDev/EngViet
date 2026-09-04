import type { Metadata } from "next";
import { getFormatter, getTranslations } from "next-intl/server";
import { InfoCircleOutlined } from "@/components/icons";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlanCard } from "@/components/features/billing/plan-card";
import { LazyQrCheckout } from "@/components/features/billing/qr-checkout.lazy";
import { buildPrivateMetadata } from "@/lib/seo";
import { getPlans, getMyTransactions } from "@/lib/api/billing";
import { getTeacherSummary } from "@/lib/api/classes";
import { formatCurrencyVND } from "@/lib/utils";
import type { TransactionStatus } from "@/lib/types";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dash.teacher.billing");
  return buildPrivateMetadata(t("meta"));
}

const STATUS_VARIANT: Record<TransactionStatus, "success" | "warning" | "error-soft" | "neutral"> = {
  paid: "success",
  pending: "warning",
  failed: "error-soft",
  expired: "neutral",
};

export default async function TeacherBillingPage() {
  const t = await getTranslations("dash.teacher.billing");
  const tStatus = await getTranslations("dash.admin.status");
  const format = await getFormatter();

  const [plans, summary, transactions] = await Promise.all([
    getPlans(),
    getTeacherSummary(),
    getMyTransactions(),
  ]);
  const subscription = summary.subscription;
  const currentPlan = plans.find((p) => p.id === subscription.planId) ?? plans[0]!;
  const pendingTransaction = transactions.find((tx) => tx.status === "pending");

  return (
    <>
      <PageHeader title={t("title")} description={t("desc")} />

      <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12">
        <section className="flex flex-col gap-6 lg:col-span-8">
          <h2 className="border-b border-outline-variant pb-2 font-heading text-headline-md text-on-surface">{t("choosePlan")}</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} selected={plan.id === subscription.planId} />
            ))}
          </div>

          <h2 className="mt-4 border-b border-outline-variant pb-2 font-heading text-headline-md text-on-surface">
            {t("transactionHistory")}
          </h2>
          <Card className="divide-y divide-outline-variant/40 p-0">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-label-md text-label-md text-on-surface">{tx.reference}</p>
                  <p className="text-body-sm text-on-surface-variant">
                    {format.dateTime(new Date(tx.createdAt), { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-label-md text-label-md text-on-surface">{formatCurrencyVND(tx.amount)}</p>
                  <Badge variant={STATUS_VARIANT[tx.status]} className="mt-1">
                    {tStatus(tx.status)}
                  </Badge>
                </div>
              </div>
            ))}
          </Card>
        </section>

        <aside className="flex flex-col gap-6 lg:col-span-4">
          <Card className="p-6 shadow-sm">
            <h3 className="mb-4 border-b border-surface-variant pb-4 font-heading text-headline-sm text-on-surface">{t("orderSummary")}</h3>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-body-md text-on-surface-variant">{t("planRow")}</span>
              <span className="font-label-md text-label-md text-on-surface">
                {t("planValue", { name: currentPlan.name, slots: subscription.slotsTotal })}
              </span>
            </div>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-body-md text-on-surface-variant">{t("nextRenewal")}</span>
              <span className="font-label-md text-label-md text-on-surface">
                {subscription.renewsAt
                  ? format.dateTime(new Date(subscription.renewsAt), { day: "2-digit", month: "2-digit", year: "numeric" })
                  : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-surface-variant pt-4">
              <span className="font-heading text-headline-sm text-on-surface">{t("total")}</span>
              <span className="font-heading text-headline-sm text-primary">
                {currentPlan.priceMonthly ? formatCurrencyVND(currentPlan.priceMonthly) : "0đ"}
              </span>
            </div>
            {pendingTransaction ? (
              <div className="mt-6 flex items-start gap-3 rounded-lg border border-tertiary-fixed bg-tertiary-container/10 p-4">
                <InfoCircleOutlined className="mt-0.5 shrink-0 text-xl text-tertiary-container" />
                <div>
                  <p className="font-label-md text-label-md text-tertiary-container">{t("pendingTitle")}</p>
                  <p className="mt-1 text-body-sm text-on-surface-variant">{t("pendingBody")}</p>
                </div>
              </div>
            ) : null}
          </Card>

          <LazyQrCheckout reference={pendingTransaction?.reference ?? "TOPTIPRO-928374"} amount={currentPlan.priceMonthly ?? 0} />
        </aside>
      </div>
    </>
  );
}
