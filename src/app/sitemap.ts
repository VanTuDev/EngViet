import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";
import { routing } from "@/i18n/routing";

/**
 * Sitemap song ngữ: mỗi route public phát ra một bản cho `/vi` và `/en`,
 * kèm `alternates.languages` (hreflang) để công cụ tìm kiếm hiểu quan hệ giữa
 * hai bản dịch.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/pricing", "/login", "/register", "/join", "/help"];

  return routes.flatMap((route) =>
    routing.locales.map((locale) => ({
      url: new URL(`/${locale}${route}`, siteConfig.url).toString(),
      lastModified: new Date(),
      changeFrequency: route === "" ? ("weekly" as const) : ("monthly" as const),
      priority: route === "" ? 1 : 0.7,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((l) => [l, new URL(`/${l}${route}`, siteConfig.url).toString()]),
        ),
      },
    })),
  );
}
