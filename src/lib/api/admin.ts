import { apiServer } from "@/lib/api/server";
import type { Paginated } from "@/lib/api/envelope";
import type { PlatformStats, RevenuePoint } from "@/lib/types";

export async function getPlatformStats(): Promise<PlatformStats> {
  return apiServer<PlatformStats>("/admin/stats");
}

export async function getRevenueTrend(months = 6): Promise<RevenuePoint[]> {
  return apiServer<RevenuePoint[]>(`/admin/revenue-trend?months=${months}`);
}

export interface TeacherOverview {
  id: string;
  fullName: string;
  email: string;
  isActive: boolean;
  planId: string | null;
  slotsUsed: number;
  slotsTotal: number;
  classCount: number;
}

export async function getTeacherOverviews(): Promise<TeacherOverview[]> {
  const res = await apiServer<Paginated<TeacherOverview>>("/admin/teachers?limit=100");
  return res.data;
}
