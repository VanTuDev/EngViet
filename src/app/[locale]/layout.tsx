import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Inter, Lexend } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { JsonLd } from "@/components/seo/json-ld";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { ThemeScript } from "@/components/theme/theme-script";
import { organizationSchema, softwareApplicationSchema } from "@/lib/structured-data";
import { siteConfig } from "@/lib/site";
import { routing } from "@/i18n/routing";
import "../globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});

const lexend = Lexend({
  subsets: ["latin", "vietnamese"],
  variable: "--font-lexend",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

/**
 * Sinh sẵn trang tĩnh cho từng ngôn ngữ (`/vi`, `/en`) lúc build.
 */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  // Giá trị khởi tạo; ThemeToggle cập nhật theo lựa chọn của người dùng.
  themeColor: "#f8f9ff",
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
  // Cho nội dung tràn ra vùng notch/tai thỏ; padding safe-area xử lý ở CSS.
  viewportFit: "cover",
};

/**
 * Metadata gốc, dịch theo ngôn ngữ. `alternates.languages` khai báo bản
 * song ngữ cho công cụ tìm kiếm (hreflang).
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: `${siteConfig.name} - ${t("tagline")}`,
      template: `%s | ${siteConfig.name}`,
    },
    description: t("description"),
    keywords: t("keywords").split("|"),
    authors: [{ name: siteConfig.fullName }],
    creator: siteConfig.fullName,
    applicationName: siteConfig.name,
    alternates: {
      canonical: `/${locale}`,
      languages: {
        vi: "/vi",
        en: "/en",
        "x-default": "/vi",
      },
    },
    openGraph: {
      type: "website",
      locale: locale === "vi" ? "vi_VN" : "en_US",
      url: `${siteConfig.url}/${locale}`,
      siteName: siteConfig.fullName,
      title: `${siteConfig.name} - ${t("tagline")}`,
      description: t("description"),
      images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: siteConfig.fullName }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${siteConfig.name} - ${t("tagline")}`,
      description: t("description"),
    },
    icons: {
      icon: [
        { url: "/favicon.svg", type: "image/svg+xml" },
        { url: "/icon", type: "image/png", sizes: "512x512" },
      ],
      apple: [{ url: "/apple-icon", sizes: "180x180" }],
    },
    manifest: "/manifest.webmanifest",
    appleWebApp: {
      capable: true,
      title: siteConfig.name,
      statusBarStyle: "default",
    },
    formatDetection: { telephone: false },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Segment không hợp lệ (bot dò đường dẫn lạ) -> 404 thay vì render hỏng.
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Bật static rendering cho các trang phía dưới ở ngôn ngữ này.
  setRequestLocale(locale);
  const tCommon = await getTranslations({ locale, namespace: "common" });

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${lexend.variable}`}
      // Script trong <head> đổi class .dark trên <html> trước khi hydrate.
      suppressHydrationWarning
    >
      <head>
        {/* Đặt class .dark trước khi paint để không nháy sáng khi tải trang. */}
        <ThemeScript />
      </head>
      <body className="min-h-screen bg-background font-body text-on-background">
        <a
          href="#main"
          className="sr-only z-[100] rounded-lg bg-primary px-4 py-2 font-label-md text-label-md text-on-primary focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          {tCommon("skipToContent")}
        </a>
        <JsonLd data={organizationSchema()} />
        <JsonLd data={softwareApplicationSchema()} />
        {/* antd + AuthProvider chỉ bọc khu vực dashboard (xem teacher/student/admin
            layout) — trang marketing/login giữ static, không đọc cookie. */}
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
