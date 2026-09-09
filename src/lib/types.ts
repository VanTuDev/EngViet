// Core domain types shared across the app. These mirror the response DTOs of
// the NestJS backend (Backend-EngViet); the `lib/api/*` modules map raw
// responses onto them so UI components never see backend-shaped data.

export type Role = "admin" | "teacher" | "student";

export interface EarnedBadge {
  code: string;
  earnedAt: string;
}

/** The authenticated user, as returned by `GET /users/me` and the auth endpoints. */
export interface ApiUser {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  /** Email confirmed via the verification link — this is what unlocks the teacher workspace for a student. */
  emailVerified: boolean;
  /** `role === "teacher"` OR a student who has verified their email. The one flag the UI gates "teacher mode" on. */
  canTeach: boolean;
  avatarUrl?: string;
  /** ISO date. */
  dateOfBirth?: string;
  bio?: string;
  learningGoal?: string;
  xp: number;
  /** Derived from `xp` by the backend. */
  level: number;
  /** Title code shown next to the name (the user's pick, or the highest their level unlocks). */
  title: string;
  badges: EarnedBadge[];
  createdAt: string;
}

/** `GET /gamification/me` — the profile page's level bar, title picker and badge grid. */
export interface GamificationSummary {
  xp: number;
  level: number;
  levelXp: number;
  span: number;
  toNext: number;
  displayTitle: string;
  unlockedTitleCodes: string[];
  badges: EarnedBadge[];
  streakDays: number;
  streakBonusActive: boolean;
  masteredWords: number;
}

/** The XP/level/badge outcome of a quiz, matching game or SRS review — drives the celebration. */
export interface XpReward {
  awarded: number;
  multiplier: number;
  leveledUp: boolean;
  level: number;
  newBadges: string[];
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
  /** Only present on the submit response (not when re-fetching a past result). */
  xp?: XpReward;
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
// Live minigame ("phòng chơi realtime") — teacher-hosted, Kahoot-style
// ---------------------------------------------------------------------------

export type GameQuestionKind = "multiple_choice" | "fill_blank" | "scramble";

export interface GameQuestion {
  prompt: string;
  imageUrl?: string;
  kind: GameQuestionKind;
  timeLimitSeconds: number;
  /** `multiple_choice` — exactly 4, in on-screen A/B/C/D order (array position is the key). */
  options?: string[];
  /** `multiple_choice` — index into `options`. */
  correctIndex?: number;
  /** `fill_blank` — answers accepted verbatim; anything else the AI judges at reveal. */
  acceptedAnswers?: string[];
  /** `scramble` — the target word the shuffled letters spell. */
  answer?: string;
}

/**
 * What a student's device sees before answering — never `correctIndex` / `answer` / `acceptedAnswers`.
 * `options` for `multiple_choice`, `scrambledLetters` (a shuffle of the target word) for `scramble`,
 * prompt-only for `fill_blank`.
 */
export type PlayableGameQuestion = Omit<GameQuestion, "correctIndex" | "answer" | "acceptedAnswers"> & {
  scrambledLetters?: string[];
};

export interface QuizSetSummary {
  id: string;
  title: string;
  questionCount: number;
  createdAt: string;
}

export interface QuizSet {
  id: string;
  title: string;
  questions: GameQuestion[];
  createdAt: string;
}

export type GameSessionStatus = "lobby" | "question" | "reveal" | "finished";
export type GameTopCount = 3 | 5 | 10;

export interface GameSession {
  id: string;
  pin: string;
  status: GameSessionStatus;
  title: string;
  questionCount: number;
  topCount: GameTopCount;
  currentQuestionIndex: number;
  classId?: string;
  createdAt: string;
}

export interface GameLeaderboardEntry {
  rank: number;
  studentId: string;
  studentName: string;
  avatarUrl?: string;
  level?: number;
  title?: string;
  score: number;
}

// ---------------------------------------------------------------------------
// Exam schedule — realtime notifications ("nhắc lịch thi")
// ---------------------------------------------------------------------------

export type AppNotificationType =
  | "new_assignment"
  | "deadline_reminder"
  | "srs_review_due"
  | "badge_earned"
  | "email_verification";

/** Named `AppNotification`, not `Notification` — that name collides with the browser's own global `Notification` API. */
export interface AppNotification {
  id: string;
  type: AppNotificationType;
  title: string;
  message: string;
  classId?: string;
  assignmentId?: string;
  read: boolean;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Spaced-repetition vocabulary review ("ôn từ vựng") — SM-2
// ---------------------------------------------------------------------------

export type SrsGrade = "again" | "hard" | "good" | "easy";

export interface SrsCard {
  id: string;
  word: string;
  ipa: string;
  meaning: string;
  example: string;
  /** Never reviewed before. */
  isNew: boolean;
  /** Missed in a quiz at least once. */
  fromMistake: boolean;
  repetitions: number;
  intervalDays: number;
  easeFactor: number;
}

export interface SrsStreak {
  current: number;
  longest: number;
  reviewedToday: boolean;
}

export interface SrsReviewQueue {
  cards: SrsCard[];
  dueCount: number;
  newCount: number;
  streak: SrsStreak;
  reviewedToday: number;
}

export interface SrsGradeResult {
  advanced: boolean;
  intervalDays: number;
  dueAt: string;
  xpAwarded: number;
  streak: SrsStreak;
  reviewedToday: number;
}

export interface SrsSummary {
  dueCount: number;
  totalCards: number;
  reviewedToday: number;
  streak: SrsStreak;
}

export interface SrsHardWord {
  word: string;
  meaning: string;
  learners: number;
  totalLapses: number;
  strugglingLearners: number;
}

export interface SrsStreakLeaderRow {
  studentId: string;
  studentName: string;
  avatarUrl?: string;
  level: number;
  currentStreak: number;
  dueCount: number;
  lastReviewDayKey: string | null;
}

export interface SrsInsights {
  classId: string;
  className: string;
  totalStudents: number;
  activeLearners: number;
  reviewedTodayCount: number;
  hardestWords: SrsHardWord[];
  streakLeaders: SrsStreakLeaderRow[];
  needNudge: SrsStreakLeaderRow[];
}

// ---------------------------------------------------------------------------
// Shareable vocabulary decks ("bộ thẻ")
// ---------------------------------------------------------------------------

export interface DeckEntry {
  word: string;
  ipa: string;
  meaning: string;
  example: string;
}

/** Full deck (owner or class-member view). */
export interface VocabDeck {
  id: string;
  ownerId: string;
  ownerRole: Role;
  ownerName?: string;
  title: string;
  description: string;
  shareCode: string;
  classId?: string;
  className?: string;
  entryCount: number;
  importCount: number;
  entries: DeckEntry[];
  createdAt: string;
  updatedAt: string;
}

/** List row — no entries. */
export interface DeckSummary {
  id: string;
  title: string;
  description: string;
  shareCode: string;
  ownerRole: Role;
  ownerName?: string;
  mine: boolean;
  classId?: string;
  entryCount: number;
  importCount: number;
  updatedAt: string;
}

/** What a share code shows before you import. */
export interface DeckPreview {
  id: string;
  title: string;
  description: string;
  shareCode: string;
  ownerName?: string;
  ownerRole: Role;
  entryCount: number;
  importCount: number;
  sampleWords: string[];
  alreadyMine: boolean;
}

export interface DeckImportResult {
  deckId: string;
  deckTitle: string;
  cardsAdded: number;
  alreadyHad: number;
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
