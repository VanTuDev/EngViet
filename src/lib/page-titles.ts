import type { Role } from "@/lib/types";

interface SectionTitle {
  /** Khóa dịch trong namespace `pageTitles` (vd `"teacher.dashboard.title"`). */
  titleKey: string;
  subtitleKey?: string;
}

type TitleMap = Record<string, SectionTitle>;

/**
 * Bản đồ route -> khóa tiêu đề/mô tả cho thanh trên cùng của dashboard.
 * Không chứa chuỗi cứng: `TopBar` tự dịch các khóa này theo ngôn ngữ hiện tại.
 * Thêm route mới thì khai báo khóa ở đây, đừng truyền tiêu đề qua prop từng trang.
 */
const TITLES: Record<Role, TitleMap> = {
  teacher: {
    "/teacher/dashboard": { titleKey: "teacher.dashboard.title", subtitleKey: "teacher.dashboard.subtitle" },
    "/teacher/classes": { titleKey: "teacher.classes.title", subtitleKey: "teacher.classes.subtitle" },
    "/teacher/assignments": { titleKey: "teacher.assignments.title", subtitleKey: "teacher.assignments.subtitle" },
    "/teacher/schedule": { titleKey: "teacher.schedule.title", subtitleKey: "teacher.schedule.subtitle" },
    "/teacher/games": { titleKey: "teacher.games.title", subtitleKey: "teacher.games.subtitle" },
    "/teacher/vocabulary": { titleKey: "teacher.vocabulary.title", subtitleKey: "teacher.vocabulary.subtitle" },
    "/teacher/reports": { titleKey: "teacher.reports.title", subtitleKey: "teacher.reports.subtitle" },
    "/teacher/billing": { titleKey: "teacher.billing.title", subtitleKey: "teacher.billing.subtitle" },
    "/teacher/settings": { titleKey: "teacher.settings.title", subtitleKey: "teacher.settings.subtitle" },
  },
  student: {
    "/student/dashboard": { titleKey: "student.dashboard.title", subtitleKey: "student.dashboard.subtitle" },
    "/student/classes": { titleKey: "student.classes.title", subtitleKey: "student.classes.subtitle" },
    "/student/assignments": { titleKey: "student.assignments.title", subtitleKey: "student.assignments.subtitle" },
    "/student/review": { titleKey: "student.review.title", subtitleKey: "student.review.subtitle" },
    "/student/decks": { titleKey: "student.decks.title", subtitleKey: "student.decks.subtitle" },
    "/student/schedule": { titleKey: "student.schedule.title", subtitleKey: "student.schedule.subtitle" },
    "/student/games": { titleKey: "student.games.title", subtitleKey: "student.games.subtitle" },
    "/student/leaderboard": { titleKey: "student.leaderboard.title", subtitleKey: "student.leaderboard.subtitle" },
    "/student/settings": { titleKey: "student.settings.title", subtitleKey: "student.settings.subtitle" },
  },
  admin: {
    "/admin/dashboard": { titleKey: "admin.dashboard.title", subtitleKey: "admin.dashboard.subtitle" },
    "/admin/transactions": { titleKey: "admin.transactions.title", subtitleKey: "admin.transactions.subtitle" },
    "/admin/pricing-plans": { titleKey: "admin.pricingPlans.title", subtitleKey: "admin.pricingPlans.subtitle" },
    "/admin/teachers": { titleKey: "admin.teachers.title", subtitleKey: "admin.teachers.subtitle" },
    "/admin/settings": { titleKey: "admin.settings.title", subtitleKey: "admin.settings.subtitle" },
  },
};

/** Tìm khóa tiêu đề của route hiện tại bằng cách khớp tiền tố dài nhất. */
export function getSectionTitle(role: Role, pathname: string): SectionTitle {
  const map = TITLES[role];
  const match = Object.keys(map)
    .filter((prefix) => pathname.startsWith(prefix))
    .sort((a, b) => b.length - a.length)[0];

  return match ? map[match]! : { titleKey: "fallback" };
}
