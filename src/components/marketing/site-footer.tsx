import { getTranslations } from "next-intl/server";
import { siteConfig } from "@/lib/site";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { GradientMesh } from "@/components/art/gradient-mesh";
import { Link } from "@/i18n/navigation";

export async function SiteFooter() {
  const t = await getTranslations("marketing.footer");

  const groups = [
    {
      title: t("productTitle"),
      links: [
        { href: "/pricing", label: t("product.pricing"), external: false },
        { href: "/register", label: t("product.forTeachers"), external: false },
        { href: "/join", label: t("product.forStudents"), external: false },
      ],
    },
    {
      title: t("supportTitle"),
      links: [
        { href: "/help", label: t("support.helpCenter"), external: false },
        { href: `mailto:${siteConfig.supportEmail}`, label: siteConfig.supportEmail, external: true },
      ],
    },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-outline-variant/50 bg-surface-container-low">
      <GradientMesh seedKey="footer" blobs={3} className="opacity-70" />
      <div className="relative mx-auto grid w-full max-w-container gap-10 px-margin-mobile py-12 md:grid-cols-[2fr_1fr_1fr] md:px-margin-desktop">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary font-heading text-headline-sm font-bold text-on-primary">
              T
            </span>
            <span className="font-heading text-headline-sm font-bold text-primary">{siteConfig.name}</span>
          </div>
          <p className="mt-3 max-w-sm text-body-sm text-on-surface-variant">{t("tagline")}</p>
          <div className="mt-5">
            <LanguageSwitcher variant="compact" />
          </div>
        </div>

        {groups.map((group) => (
          <div key={group.title}>
            <h3 className="font-label-md text-label-md text-on-surface">{group.title}</h3>
            <ul className="mt-3 flex flex-col gap-2">
              {group.links.map((link) => (
                <li key={link.href}>
                  {link.external ? (
                    <a href={link.href} className="text-body-sm text-on-surface-variant hover:text-primary hover:underline">
                      {link.label}
                    </a>
                  ) : (
                    <Link href={link.href} className="text-body-sm text-on-surface-variant hover:text-primary hover:underline">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-outline-variant/50 px-margin-mobile py-4 text-center font-label-sm text-label-sm text-on-surface-variant md:px-margin-desktop">
        {t("rights", { year: new Date().getFullYear(), name: siteConfig.legalName })}
      </div>
    </footer>
  );
}
