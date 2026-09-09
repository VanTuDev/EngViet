import type { ComponentType } from "react";
import {
  AccountBookOutlined,
  AppstoreOutlined,
  BarChartOutlined,
  CalendarOutlined,
  CreditCardOutlined,
  DashboardOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  ReadOutlined,
  SettingOutlined,
  TagsOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  TrophyOutlined,
} from "@/components/icons";
import type { Role } from "@/lib/types";

/** Minimal contract every icon component in this app must satisfy (Ant Design icons and any future replacement both fit this). */
export type IconType = ComponentType<{ className?: string }>;

export interface NavItem {
  /**
   * Khóa dịch trong namespace `nav` của messages (vd `"teacherDashboard"`).
   * Component điều hướng tự resolve sang chữ theo ngôn ngữ hiện tại — nhờ vậy
   * danh sách menu này không chứa chuỗi cứng.
   */
  labelKey: string;
  href: string;
  icon: IconType;
}

export interface NavGroup {
  /** Khóa dịch trong `nav.groups.*` — tiêu đề nhóm hiển thị mờ phía trên các mục. */
  labelKey: string;
  items: NavItem[];
}

/**
 * Ba "khu làm việc" của thanh bên. Một học sinh đã xác thực email (`canTeach`)
 * có thể chuyển qua lại giữa `student` và `teacher` bằng bộ chuyển ở đầu sidebar.
 * `admin` là khu riêng.
 */
export type WorkspaceMode = Role;

// -- nhóm mục điều hướng, đặt tên rõ ràng để vừa dựng `NAV_GROUPS` vừa dựng các
//    danh sách phẳng (`NAV_ITEMS`/`SECONDARY_NAV_ITEMS`) mà không phải index mảng.
const TEACHER_MANAGE: NavItem[] = [
  { labelKey: "teacherDashboard", href: "/teacher/dashboard", icon: DashboardOutlined },
  { labelKey: "teacherClasses", href: "/teacher/classes", icon: TeamOutlined },
  { labelKey: "teacherAssignments", href: "/teacher/assignments", icon: FileTextOutlined },
  { labelKey: "teacherSchedule", href: "/teacher/schedule", icon: CalendarOutlined },
  { labelKey: "teacherGames", href: "/teacher/games", icon: ThunderboltOutlined },
  { labelKey: "teacherVocabulary", href: "/teacher/vocabulary", icon: ReadOutlined },
  { labelKey: "teacherReports", href: "/teacher/reports", icon: BarChartOutlined },
  { labelKey: "teacherBilling", href: "/teacher/billing", icon: CreditCardOutlined },
];
const TEACHER_SETTINGS: NavItem[] = [
  { labelKey: "settings", href: "/teacher/settings", icon: SettingOutlined },
  { labelKey: "helpCenter", href: "/help", icon: QuestionCircleOutlined },
];

// `MobileBottomNav` shows only the first 4 of these. "review" (daily spaced-repetition habit)
// takes the 4th slot ahead of "schedule"/"leaderboard" on purpose — it's the one screen a
// student is meant to open every day; schedule + leaderboard stay in the sidebar / mobile drawer.
const STUDENT_LEARN: NavItem[] = [
  { labelKey: "studentDashboard", href: "/student/dashboard", icon: DashboardOutlined },
  { labelKey: "studentClasses", href: "/student/classes", icon: TeamOutlined },
  { labelKey: "studentAssignments", href: "/student/assignments", icon: FileTextOutlined },
  { labelKey: "studentReview", href: "/student/review", icon: ReadOutlined },
  { labelKey: "studentDecks", href: "/student/decks", icon: AppstoreOutlined },
  { labelKey: "studentSchedule", href: "/student/schedule", icon: CalendarOutlined },
  { labelKey: "studentLeaderboard", href: "/student/leaderboard", icon: TrophyOutlined },
];
const STUDENT_SETTINGS: NavItem[] = [
  { labelKey: "joinGame", href: "/student/games/join", icon: ThunderboltOutlined },
  { labelKey: "settings", href: "/student/settings", icon: SettingOutlined },
  { labelKey: "helpCenter", href: "/help", icon: QuestionCircleOutlined },
];

const ADMIN_MANAGE: NavItem[] = [
  { labelKey: "adminDashboard", href: "/admin/dashboard", icon: DashboardOutlined },
  { labelKey: "adminTransactions", href: "/admin/transactions", icon: AccountBookOutlined },
  { labelKey: "adminPricingPlans", href: "/admin/pricing-plans", icon: TagsOutlined },
  { labelKey: "adminTeachers", href: "/admin/teachers", icon: ReadOutlined },
];
const ADMIN_SETTINGS: NavItem[] = [{ labelKey: "settings", href: "/admin/settings", icon: SettingOutlined }];

/** Điều hướng chia nhóm theo ngữ cảnh — nguồn dữ liệu chính cho `Sidebar`. */
export const NAV_GROUPS: Record<WorkspaceMode, NavGroup[]> = {
  teacher: [
    { labelKey: "manage", items: TEACHER_MANAGE },
    { labelKey: "settings", items: TEACHER_SETTINGS },
  ],
  student: [
    { labelKey: "learn", items: STUDENT_LEARN },
    { labelKey: "settings", items: STUDENT_SETTINGS },
  ],
  admin: [
    { labelKey: "manage", items: ADMIN_MANAGE },
    { labelKey: "settings", items: ADMIN_SETTINGS },
  ],
};

/** Danh sách phẳng của nhóm chính — dùng cho tab dưới cùng (mobile) và bảng lệnh ⌘K. */
export const NAV_ITEMS: Record<Role, NavItem[]> = {
  teacher: TEACHER_MANAGE,
  student: STUDENT_LEARN,
  admin: ADMIN_MANAGE,
};

export const SECONDARY_NAV_ITEMS: Record<Role, NavItem[]> = {
  teacher: TEACHER_SETTINGS,
  student: STUDENT_SETTINGS,
  admin: ADMIN_SETTINGS,
};

/** Bottom tab bar shown on mobile for the student experience (max 4 items). */
export const STUDENT_MOBILE_NAV = NAV_ITEMS.student;

export const CLASS_CODE_LENGTH = 6;
