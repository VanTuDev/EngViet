import { apiPublic, apiServer } from "@/lib/api/server";
import type { Paginated } from "@/lib/api/envelope";
import type {
  ClassActivityItem,
  ClassPerformanceSummary,
  ClassRoom,
  StudentProfile,
  TeacherSummary,
} from "@/lib/types";

interface ClassDto {
  id: string;
  name: string;
  code: string;
  teacherId: string;
  teacherName?: string;
  description?: string;
  status: "active" | "archived";
  studentCount: number;
  createdAt: string;
}

function toClass(d: ClassDto): ClassRoom {
  return {
    id: d.id,
    name: d.name,
    code: d.code,
    teacherId: d.teacherId,
    teacherName: d.teacherName,
    description: d.description,
    studentCount: d.studentCount ?? 0,
    status: d.status,
    createdAt: d.createdAt,
  };
}

/** Teacher: classes they own. Student: classes they've joined. */
export async function getMyClasses(): Promise<ClassRoom[]> {
  const res = await apiServer<Paginated<ClassDto>>("/classes/mine?limit=100");
  return res.data.map(toClass);
}

export async function getClass(id: string): Promise<ClassRoom | null> {
  try {
    return toClass(await apiServer<ClassDto>(`/classes/${id}`));
  } catch {
    return null;
  }
}

/** Public — the QR/deep-link join preview page. */
export async function getClassByCode(code: string): Promise<ClassRoom | null> {
  try {
    return toClass(await apiPublic<ClassDto>(`/classes/by-code/${encodeURIComponent(code)}`));
  } catch {
    return null;
  }
}

interface UserDto {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  xp: number;
}

export async function getClassRoster(classId: string): Promise<StudentProfile[]> {
  const res = await apiServer<Paginated<UserDto>>(`/classes/${classId}/students?limit=100`);
  return res.data.map((u) => ({
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    avatarUrl: u.avatarUrl,
    xp: u.xp ?? 0,
  }));
}

export async function getClassPerformance(classId: string): Promise<ClassPerformanceSummary> {
  return apiServer<ClassPerformanceSummary>(`/leaderboard/classes/${classId}/performance`);
}

export async function getTeacherSummary(): Promise<TeacherSummary> {
  return apiServer<TeacherSummary>("/classes/mine/summary");
}

export async function getTeacherActivity(): Promise<ClassActivityItem[]> {
  return apiServer<ClassActivityItem[]>("/leaderboard/teacher/activity");
}
