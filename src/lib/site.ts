// Central site configuration used by metadata, JSON-LD and the marketing pages.
// Keeping this in one place means SEO facts (name, description, URLs) never
// drift out of sync between the different places Next.js needs them.

export const siteConfig = {
  name: "TOPTI",
  fullName: "TOPTI Learning System",
  legalName: "TOPTI Learning System",
  tagline: "Nền tảng giao bài tập & luyện thi IELTS tự động cho giáo viên tự do",
  description:
    "TOPTI giúp giáo viên tiếng Anh tự do giao tài liệu, tổ chức thi trắc nghiệm ABCD và minigame ghép từ vựng có bấm giờ, tự động chấm điểm và thống kê kết quả cho lớp luyện thi IELTS.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://topti.vn",
  ogImage: "/opengraph-image",
  locale: "vi_VN",
  keywords: [
    "TOPTI",
    "phần mềm giao bài tập tiếng Anh",
    "luyện thi IELTS online",
    "trắc nghiệm từ vựng ABCD",
    "minigame ghép từ vựng",
    "quản lý lớp học tiếng Anh",
    "chấm điểm tự động",
    "class code học sinh",
  ],
  social: {
    facebook: "https://facebook.com/topti.vn",
  },
  supportEmail: "support@topti.vn",
} as const;

// Ghi chú i18n: `tagline` / `description` / `keywords` ở trên là bản tiếng Việt
// mặc định, chỉ dùng cho các artifact KHÔNG địa phương hóa (sitemap, robots,
// manifest, llms.txt, opengraph-image). Chữ hiển thị theo ngôn ngữ nằm trong
// `messages/{vi,en}.json` (namespace `seo`, `roles`, ...).
