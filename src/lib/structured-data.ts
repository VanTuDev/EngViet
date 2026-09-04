import { siteConfig } from "@/lib/site";
import type { Plan } from "@/lib/types";

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.legalName,
    url: siteConfig.url,
    logo: new URL("/logo.svg", siteConfig.url).toString(),
    sameAs: Object.values(siteConfig.social),
    email: siteConfig.supportEmail,
  };
}

export function softwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteConfig.fullName,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    description: siteConfig.description,
    url: siteConfig.url,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "VND",
      lowPrice: "0",
      highPrice: "500000",
    },
  };
}

export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function pricingOffersSchema(plans: Plan[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${siteConfig.name} - Gói dịch vụ giáo viên`,
    description: "Các gói cước dành cho giáo viên tiếng Anh tự do sử dụng nền tảng TOPTI.",
    offers: plans
      .filter((plan) => plan.priceMonthly !== null)
      .map((plan) => ({
        "@type": "Offer",
        name: plan.name,
        price: String(plan.priceMonthly ?? 0),
        priceCurrency: "VND",
        description: plan.tagline,
      })),
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: new URL(item.path, siteConfig.url).toString(),
    })),
  };
}
