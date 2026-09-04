import type { ComponentType } from "react";
import {
  AccountBookOutlined,
  BarChartOutlined,
  CreditCardOutlined,
  DashboardOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  ReadOutlined,
  SettingOutlined,
  TagsOutlined,
  TeamOutlined,
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

export const NAV_ITEMS: Record<Role, NavItem[]> = {
  teacher: [
    { labelKey: "teacherDashboard", href: "/teacher/dashboard", icon: DashboardOutlined },
    { labelKey: "teacherClasses", href: "/teacher/classes", icon: TeamOutlined },
    { labelKey: "teacherAssignments", href: "/teacher/assignments", icon: FileTextOutlined },
    { labelKey: "teacherReports", href: "/teacher/reports", icon: BarChartOutlined },
    { labelKey: "teacherBilling", href: "/teacher/billing", icon: CreditCardOutlined },
  ],
  student: [
    { labelKey: "studentDashboard", href: "/student/dashboard", icon: DashboardOutlined },
    { labelKey: "studentClasses", href: "/student/classes", icon: TeamOutlined },
    { labelKey: "studentAssignments", href: "/student/assignments", icon: FileTextOutlined },
    { labelKey: "studentLeaderboard", href: "/student/leaderboard", icon: TrophyOutlined },
  ],
  admin: [
    { labelKey: "adminDashboard", href: "/admin/dashboard", icon: DashboardOutlined },
    { labelKey: "adminTransactions", href: "/admin/transactions", icon: AccountBookOutlined },
    { labelKey: "adminPricingPlans", href: "/admin/pricing-plans", icon: TagsOutlined },
    { labelKey: "adminTeachers", href: "/admin/teachers", icon: ReadOutlined },
  ],
};

export const SECONDARY_NAV_ITEMS: Record<Role, NavItem[]> = {
  teacher: [
    { labelKey: "settings", href: "/teacher/settings", icon: SettingOutlined },
    { labelKey: "helpCenter", href: "/help", icon: QuestionCircleOutlined },
  ],
  student: [
    { labelKey: "settings", href: "/student/settings", icon: SettingOutlined },
    { labelKey: "helpCenter", href: "/help", icon: QuestionCircleOutlined },
  ],
  admin: [{ labelKey: "settings", href: "/admin/settings", icon: SettingOutlined }],
};

/** Bottom tab bar shown on mobile for the student experience (max 4 items). */
export const STUDENT_MOBILE_NAV = NAV_ITEMS.student;

export const CLASS_CODE_LENGTH = 6;
