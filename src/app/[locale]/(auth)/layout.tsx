import { getTranslations, setRequestLocale } from "next-intl/server";
import { CheckCircleOutlined } from "@/components/icons";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { AuthPanelArt } from "@/components/art/auth-panel-art";
import { Reveal } from "@/components/motion/reveal";
import { siteConfig } from "@/lib/site";
import { Link } from "@/i18n/navigation";

export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth.brandPanel");
  const points = t.raw("points") as string[];

  return (
    <div className="flex min-h-screen bg-surface-container-low">
      {/* Cột thương hiệu — chỉ hiện trên desktop. Nền xanh đậm cố định (không
          theo dark/light) để chữ trắng của artwork luôn đọc được. */}
      <aside
        className="relative hidden w-[46%] flex-col justify-between overflow-hidden p-12 text-white lg:flex"
        style={{ background: "linear-gradient(150deg, #003a9e 0%, #004ac6 55%, #12235e 100%)" }}
      >
        <AuthPanelArt />
        <Link href="/" className="relative flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15 font-heading text-headline-sm font-bold">
            T
          </span>
          <span className="font-heading text-headline-md font-bold">{siteConfig.name}</span>
        </Link>

        <Reveal className="relative" y={20}>
          <h2 className="font-heading text-headline-lg">{t("title")}</h2>
          <p className="mt-3 max-w-md text-body-md text-white/85">{t("subtitle")}</p>
          <ul className="mt-8 flex flex-col gap-3">
            {points.map((point) => (
              <li key={point} className="flex items-start gap-3 text-body-sm text-white/90">
                <CheckCircleOutlined className="mt-0.5 shrink-0 text-base text-[#6cf8bb]" aria-hidden="true" />
                {point}
              </li>
            ))}
          </ul>
        </Reveal>

        <div className="relative" />
      </aside>

      {/* Cột form. */}
      <div className="flex flex-1 flex-col items-center justify-center px-margin-mobile py-12">
        <div className="mb-6 flex w-full max-w-md items-center justify-between">
          <Link href="/" className="flex items-center gap-2 lg:invisible">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary font-heading text-headline-sm font-bold text-on-primary">
              T
            </span>
            <span className="font-heading text-headline-sm font-bold text-primary">{siteConfig.name}</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher variant="compact" />
          </div>
        </div>
        <div className="w-full max-w-md rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-8 shadow-card">
          {children}
        </div>
      </div>
    </div>
  );
}
