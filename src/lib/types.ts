// Core domain types shared across the app. These mirror the response DTOs of
// the NestJS backend (Backend-EngViet); the `lib/api/*` modules map raw
// responses onto them so UI components never see backend-shaped data.

export type Role = "admin" | "teacher" | "student";

/** The authenticated user, as returned by `GET /users/me` and the auth endpoints. */
export interface ApiUser {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  avatarUrl?: string;
  xp: number;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
}

// ---------------------------------------------------------------------------
// UC01 / UC02 — Billing & subscription plans
// ---------------------------------------------------------------------------

export type PlanId = "free" | "pro" | "enterprise";

export interface Plan {
  id: PlanId;
  name: string;
  tagline: string;
  priceMonthly: number | null; // null = "Custom" / contact sales
  studentSlots: number | "unlimited";
  features: { label: string; included: boolean }[];
  highlighted?: boolean;
}

export type TransactionStatus = "pending" | "paid" | "failed" | "expired";

export interface Transaction {
  id: string;
  reference: string;
  teacherId: string;
  teacherName: string;
  planId: PlanId;
  amount: number;
  status: TransactionStatus;
  createdAt: string;
  paidAt?: string;
}

export interface TeacherSubscription {
  teacherId: string;
  planId: PlanId;
  slotsTotal: number;
  slotsUsed: number;
  renewsAt: string;
}

// ---------------------------------------------------------------------------
// UC03 / UC04 — Classes & class membership
// ---------------------------------------------------------------------------

export type ClassStatus = "active" | "archived";

export interface ClassRoom {
  id: string;
  name: string;
  code: string; // 6-character class code, e.g. "8899TP"
  teacherId: string;
  teacherName?: string;
  description?: string;
  studentCount: number;
  status: ClassStatus;
  createdAt: string;
}

/** A roster/leaderboard row — the backend's `UserResponseDto`. */
export interface StudentProfile {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  xp: number;
}

export interface ClassActivityItem {
  id: string;
  type: "join" | "submission" | "assignment";
  text: string;
  at: string;
}

export interface SlotUsagePoint {
  label: string;
  count: number;
}

export interface TeacherSummary {
  activeClasses: number;
  totalStudents: number;
  newStudents7d: number;
  subscription: {
    planId: string;
    planName: string;
    slotsTotal: number;
    slotsUsed: number;
    renewsAt: string | null;
  };
  slotUsageTrend: SlotUsagePoint[];
}

// ---------------------------------------------------------------------------
// UC05 — Vocabulary import & assignment generation
// ---------------------------------------------------------------------------

export interface VocabularyItem {
  id: string;
  word: string;
  ipa: string;
  meaning: string;
  example: string;
}

export interface QuizOption {
  key: "A" | "B" | "C" | "D";
  text: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: QuizOption[];
  correctKey: QuizOption["key"];
}

export type AssignmentMode = "quiz" | "matching";

export interface Assignment {
  id: string;
  classId: string;
  title: string;
  mode: AssignmentMode;
  createdAt: string;
  deadline: string;
  durationSeconds: number; // countdown budget for the whole attempt
  vocabulary: VocabularyItem[];
  questions: QuizQuestion[]; // populated when mode === "quiz"
  published: boolean;
}

// ---------------------------------------------------------------------------
// UC06 — Attempts, scoring & results
// ---------------------------------------------------------------------------

export interface QuizAnswer {
  questionId: string;
  selectedKey: QuizOption["key"] | null;
  correct: boolean;
}

/** One row of the "giải thích chi tiết từng câu" review — the backend's `QuestionReviewDto`. */
export interface QuestionReview {
  prompt: string;
  options: QuizOption[];
  correctKey: QuizOption["key"];
  selectedKey: QuizOption["key"] | null;
  isCorrect: boolean;
}

/** The backend's `SubmissionResultDto`. `studentName` is only filled where the source endpoint provides it. */
export interface AttemptResult {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName?: string;
  mode: AssignmentMode;
  score: number; // 0-100
  correctCount: number;
  totalCount: number;
  timeTakenSeconds: number;
  submittedAt: string;
  review?: QuestionReview[];
}

// ---------------------------------------------------------------------------
// UC07 — Reporting
// ---------------------------------------------------------------------------

export interface LeaderboardEntry {
  rank: number;
  studentId: string;
  studentName: string;
  avatarUrl?: string;
  score: number;
  timeTakenSeconds: number;
  trend?: "up" | "down" | "same";
}

export interface ClassPerformanceSummary {
  classId: string;
  averageScore: number;
  completionRate: number; // 0-100
  totalAssignments: number;
  totalStudents: number;
}

// ---------------------------------------------------------------------------
// Admin oversight
// ---------------------------------------------------------------------------

export interface PlatformStats {
  totalTeachers: number;
  totalStudents: number;
  totalClasses: number;
  monthlyRevenue: number;
  revenueGrowthPct: number;
  activeSubscriptions: number;
}

export interface RevenuePoint {
  label: string;
  amount: number;
}
