import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";
import type { AppLocale } from "@/i18n/routing";

interface PageMetadataInput {
  title: string;
  description: string;
  /** Đường dẫn KHÔNG kèm tiền tố ngôn ngữ, vd `"/pricing"`. Mặc định `"/"`. */
  path?: string;
  /** Ngôn ngữ hiện tại — dùng để dựng canonical `/vi/...` `/en/...` và hreflang. */
  locale: AppLocale;
  image?: string;
  noIndex?: boolean;
  /** Đặt `true` cho trang chủ: `title` đã là tiêu đề đầy đủ (kèm tên thương hiệu). */
  absoluteTitle?: boolean;
}

/**
 * Dựng đối tượng `Metadata` nhất quán (title, canonical, Open Graph, Twitter,
 * hreflang) cho một trang public. Tập trung ở đây để mọi route lấy SEO từ cùng
 * một nguồn (`lib/site.ts` + từ điển dịch).
 */
export function buildMetadata({
  title,
  description,
  path = "/",
  locale,
  image,
  noIndex,
  absoluteTitle,
}: PageMetadataInput): Metadata {
  const localizedPath = `/${locale}${path === "/" ? "" : path}`;
  const url = new URL(localizedPath, siteConfig.url).toString();
  const ogImage = image ?? siteConfig.ogImage;
  const socialTitle = absoluteTitle ? title : `${title} | ${siteConfig.name}`;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical: url,
      languages: {
        vi: `/vi${path === "/" ? "" : path}`,
        en: `/en${path === "/" ? "" : path}`,
        "x-default": `/vi${path === "/" ? "" : path}`,
      },
    },
    openGraph: {
      title: socialTitle,
      description,
      url,
      siteName: siteConfig.fullName,
      locale: locale === "vi" ? "vi_VN" : "en_US",
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [ogImage],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true } },
  };
}

/** Các route dashboard (admin/teacher/student) nằm sau đăng nhập, không có giá trị SEO. */
export function buildPrivateMetadata(title: string): Metadata {
  return {
    title,
    robots: { index: false, follow: false },
  };
}
