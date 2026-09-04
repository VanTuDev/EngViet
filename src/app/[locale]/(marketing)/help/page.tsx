import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MailOutlined } from "@/components/icons";
import { JsonLd } from "@/components/seo/json-ld";
import { GradientMesh } from "@/components/art/gradient-mesh";
import { Reveal, RevealGroup } from "@/components/motion/reveal";
import { faqSchema } from "@/lib/structured-data";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import type { AppLocale } from "@/i18n/routing";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "marketing.help" });
  return buildMetadata({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/help",
    locale: locale as AppLocale,
  });
}

export default async function HelpPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("marketing.help");
  const tRoles = await getTranslations("roles");

  const teacherTopics = t.raw("teacherTopics") as { q: string; a: string }[];
  const studentTopics = t.raw("studentTopics") as { q: string; a: string }[];
  const sections = [
    { role: tRoles("teacher"), items: teacherTopics },
    { role: tRoles("student"), items: studentTopics },
  ];
  const allFaq = [...teacherTopics, ...studentTopics].map((item) => ({ question: item.q, answer: item.a }));

  return (
    <>
      <JsonLd data={faqSchema(allFaq)} />
      <section className="relative overflow-hidden">
        <GradientMesh seedKey="help" blobs={3} className="h-72" />
        <div className="relative mx-auto w-full max-w-focus px-margin-mobile py-16 md:px-margin-desktop md:py-20">
          <Reveal>
            <h1 className="font-heading text-headline-lg-mobile text-on-surface md:text-headline-lg">{t("title")}</h1>
            <p className="mt-3 text-body-md text-on-surface-variant">{t("subtitle")}</p>
          </Reveal>

          <div className="mt-10 flex flex-col gap-10">
            {sections.map((section) => (
              <div key={section.role}>
                <Reveal>
                  <h2 className="font-heading text-headline-md text-on-surface">
                    {t("sectionForRole", { role: section.role })}
                  </h2>
                </Reveal>
                <RevealGroup stagger={70} className="mt-4 flex flex-col gap-4">
                  {section.items.map((item) => (
                    <div key={item.q} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
                      <div className="font-label-md text-label-md text-on-surface">{item.q}</div>
                      <div className="mt-2 text-body-sm text-on-surface-variant">{item.a}</div>
                    </div>
                  ))}
                </RevealGroup>
              </div>
            ))}
          </div>

          <div className="mt-12 flex items-center gap-3 rounded-xl bg-surface-container p-5">
            <MailOutlined className="shrink-0 text-xl text-primary" />
            <p className="text-body-sm text-on-surface-variant">
              {t("contactPrefix")}{" "}
              <a href={`mailto:${siteConfig.supportEmail}`} className="text-primary hover:underline">
                {siteConfig.supportEmail}
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
