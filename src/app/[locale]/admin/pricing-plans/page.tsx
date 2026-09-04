import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { PricingPlanEditor } from "@/components/features/billing/pricing-plan-editor";
import { buildPrivateMetadata } from "@/lib/seo";
import { getPlans } from "@/lib/api/billing";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dash.admin.pricingPlans");
  return buildPrivateMetadata(t("meta"));
}

export default async function AdminPricingPlansPage() {
  const t = await getTranslations("dash.admin.pricingPlans");
  const plans = await getPlans();
  return (
    <>
      <PageHeader title={t("title")} description={t("desc")} />
      <PricingPlanEditor plans={plans} />
    </>
  );
}
