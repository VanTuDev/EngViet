import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PlanCard } from "@/components/features/billing/plan-card";
import { JsonLd } from "@/components/seo/json-ld";
import { GradientMesh } from "@/components/art/gradient-mesh";
import { Reveal, RevealGroup } from "@/components/motion/reveal";
import { TiltCard } from "@/components/motion/tilt-card";
import { pricingOffersSchema, faqSchema } from "@/lib/structured-data";
import { buildMetadata } from "@/lib/seo";
import { getPlans } from "@/lib/api/billing";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "marketing.pricing" });
  return buildMetadata({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/pricing",
    locale: locale as AppLocale,
  });
}

export default async function PricingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("marketing.pricing");
  const plans = await getPlans();

  const faq = t.raw("faq") as { question: string; answer: string }[];

  return (
    <>
      <JsonLd data={pricingOffersSchema(plans)} />
      <JsonLd data={faqSchema(faq)} />

      <section className="relative overflow-hidden">
        <GradientMesh seedKey="pricing" blobs={4} className="h-[26rem]" />
        <div className="relative mx-auto w-full max-w-container px-margin-mobile py-16 md:px-margin-desktop md:py-20">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="font-heading text-headline-lg-mobile text-on-surface md:text-headline-lg">{t("title")}</h1>
              <p className="mt-3 text-body-md text-on-surface-variant">{t("subtitle")}</p>
            </div>
          </Reveal>

          <RevealGroup stagger={90} className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <div key={plan.id} className="h-full">
                <TiltCard intensity="low" className="h-full" glare={false}>
                  <PlanCard plan={plan} ctaHref={plan.id === "enterprise" ? "/help" : "/register"} />
                </TiltCard>
              </div>
            ))}
          </RevealGroup>

          <div className="mx-auto mt-16 max-w-2xl">
            <Reveal>
              <h2 className="text-center font-heading text-headline-md text-on-surface">{t("faqTitle")}</h2>
            </Reveal>
            <RevealGroup stagger={70} className="mt-6 flex flex-col gap-3">
              {faq.map((item) => (
                <details
                  key={item.question}
                  className="group rounded-xl border border-outline-variant bg-surface-container-lowest p-5 open:shadow-sm"
                >
                  <summary className="cursor-pointer list-none font-label-md text-label-md text-on-surface">{item.question}</summary>
                  <p className="mt-3 text-body-sm text-on-surface-variant">{item.answer}</p>
                </details>
              ))}
            </RevealGroup>
            <p className="mt-8 text-center text-body-sm text-on-surface-variant">
              {t("contactPrefix")}{" "}
              <Link href="/help" className="text-primary hover:underline">
                {t("contactLink")}
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
