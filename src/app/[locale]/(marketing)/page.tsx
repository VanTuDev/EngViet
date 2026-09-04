import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRightOutlined, CheckCircleOutlined, PlusOutlined } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { JsonLd } from "@/components/seo/json-ld";
import { GradientMesh } from "@/components/art/gradient-mesh";
import { HeroScene } from "@/components/art/hero-scene";
import { FeatureGlyph } from "@/components/art/feature-glyph";
import { StepIllustration } from "@/components/art/step-illustration";
import { Reveal, RevealGroup } from "@/components/motion/reveal";
import { Parallax } from "@/components/motion/parallax";
import { TiltCard } from "@/components/motion/tilt-card";
import { faqSchema } from "@/lib/structured-data";
import { buildMetadata } from "@/lib/seo";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";

const STAT_KEYS = ["students", "gradingTime", "setupTime"] as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "marketing.home" });
  const tSeo = await getTranslations({ locale, namespace: "seo" });
  return buildMetadata({
    title: t("metaTitle"),
    description: tSeo("description"),
    path: "/",
    locale: locale as AppLocale,
    absoluteTitle: true,
  });
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("marketing.home");

  const painPoints = t.raw("pain.points") as string[];
  const features = t.raw("features.items") as { title: string; description: string }[];
  const steps = t.raw("steps.items") as { title: string; description: string }[];
  const faqItems = t.raw("faq.items") as { question: string; answer: string }[];

  return (
    <>
      <JsonLd data={faqSchema(faqItems)} />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-surface-container-low">
        <GradientMesh seedKey="hero" blobs={3} className="opacity-90" />
        <div className="relative mx-auto grid w-full max-w-container items-center gap-12 px-margin-mobile py-16 md:grid-cols-[1.05fr_0.95fr] md:px-margin-desktop md:py-24">
          <Reveal y={24}>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-surface-container-lowest/70 px-3 py-1 font-label-sm text-label-sm text-primary shadow-sm backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-secondary" aria-hidden="true" />
              {t("hero.badge")}
            </span>
            <h1 className="mt-5 font-heading text-headline-lg-mobile text-on-surface md:text-headline-xl">{t("hero.title")}</h1>
            <p className="mt-5 max-w-xl text-body-lg text-on-surface-variant">{t("hero.subtitle")}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/register">
                  {t("hero.ctaPrimary")}
                  <ArrowRightOutlined aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/pricing">{t("hero.ctaSecondary")}</Link>
              </Button>
            </div>

            <RevealGroup
              stagger={90}
              className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-outline-variant/50 pt-6"
            >
              {STAT_KEYS.map((key) => (
                <div key={key}>
                  <div className="font-heading text-headline-md text-primary">{t(`hero.statsValues.${key}`)}</div>
                  <div className="mt-1 font-label-sm text-label-sm text-on-surface-variant">{t(`hero.stats.${key}`)}</div>
                </div>
              ))}
            </RevealGroup>
          </Reveal>

          <Reveal delay={120} y={28}>
            <Parallax speed={-0.06}>
              <HeroScene />
            </Parallax>
          </Reveal>
        </div>
      </section>

      {/* ── Nỗi đau hiện tại ─────────────────────────────────── */}
      <section className="mx-auto w-full max-w-container px-margin-mobile py-16 md:px-margin-desktop md:py-20">
        <Reveal>
          <h2 className="mx-auto max-w-3xl text-center font-heading text-headline-lg-mobile text-on-surface md:text-headline-lg">
            {t("pain.title")}
          </h2>
        </Reveal>
        <RevealGroup stagger={90} className="mx-auto mt-8 grid max-w-3xl gap-4">
          {painPoints.map((point) => (
            <div
              key={point}
              className="flex items-start gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-4"
            >
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-error" aria-hidden="true" />
              <p className="text-body-md text-on-surface-variant">{point}</p>
            </div>
          ))}
        </RevealGroup>
      </section>

      {/* ── Tính năng ───────────────────────────────────────── */}
      <section className="bg-grain relative bg-surface-container-low py-16 md:py-20">
        <div className="relative mx-auto w-full max-w-container px-margin-mobile md:px-margin-desktop">
          <Reveal>
            <h2 className="text-center font-heading text-headline-lg-mobile text-on-surface md:text-headline-lg">
              {t("features.title")}
            </h2>
          </Reveal>
          <RevealGroup stagger={70} className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <div key={feature.title} className="h-full">
                <TiltCard className="h-full">
                  <Card className="group flex h-full flex-col p-6 transition-shadow duration-200 hover:shadow-elevated">
                    <div className="mb-4 text-primary transition-transform duration-300 group-hover/tilt:-translate-y-0.5 group-hover/tilt:scale-105">
                      <FeatureGlyph index={i} />
                    </div>
                    <h3 className="font-heading text-headline-sm text-on-surface">{feature.title}</h3>
                    <p className="mt-2 text-body-sm text-on-surface-variant">{feature.description}</p>
                  </Card>
                </TiltCard>
              </div>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ── Các bước ────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-container px-margin-mobile py-16 md:px-margin-desktop md:py-20">
        <Reveal>
          <h2 className="text-center font-heading text-headline-lg-mobile text-on-surface md:text-headline-lg">
            {t("steps.title")}
          </h2>
        </Reveal>
        <RevealGroup stagger={90} className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="relative flex flex-col rounded-2xl border border-outline-variant bg-surface-container-lowest p-6"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-heading text-label-md font-bold text-on-primary">
                  {index + 1}
                </span>
                <StepIllustration index={index} className="opacity-90" />
              </div>
              <h3 className="mt-4 font-heading text-headline-sm text-on-surface">{step.title}</h3>
              <p className="mt-2 text-body-sm text-on-surface-variant">{step.description}</p>
            </div>
          ))}
        </RevealGroup>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────── */}
      <section className="bg-grain relative bg-surface-container-low py-16 md:py-20">
        <div className="relative mx-auto w-full max-w-focus px-margin-mobile md:px-margin-desktop">
          <Reveal>
            <h2 className="text-center font-heading text-headline-lg-mobile text-on-surface md:text-headline-lg">
              {t("faq.title")}
            </h2>
          </Reveal>
          <RevealGroup stagger={60} className="mt-8 flex flex-col gap-3">
            {faqItems.map((item) => (
              <details
                key={item.question}
                className="group rounded-xl border border-outline-variant bg-surface-container-lowest p-5 open:shadow-sm"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-label-md text-label-md text-on-surface">
                  {item.question}
                  <PlusOutlined
                    className="shrink-0 text-base text-primary transition-transform group-open:rotate-45"
                    aria-hidden="true"
                  />
                </summary>
                <p className="mt-3 text-body-sm text-on-surface-variant">{item.answer}</p>
              </details>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ── CTA cuối ────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-container px-margin-mobile py-16 md:px-margin-desktop md:py-20">
        <Reveal y={24}>
          <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-14 text-center text-on-primary md:px-12">
            <GradientMesh seedKey="cta" variant="onPrimary" blobs={4} />
            <div className="relative">
              <h2 className="font-heading text-headline-lg-mobile md:text-headline-lg">{t("cta.title")}</h2>
              <p className="mx-auto mt-3 max-w-xl text-body-md text-on-primary/85">{t("cta.subtitle")}</p>
              <div className="mt-7 flex justify-center">
                <Button asChild size="lg" variant="secondary" className="bg-surface-container-lowest">
                  <Link href="/register">
                    <CheckCircleOutlined aria-hidden="true" />
                    {t("cta.button")}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
