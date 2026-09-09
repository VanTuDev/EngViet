import type { Role } from "@/lib/types";

/**
 * Pure capability helpers shared by the proxy (`src/proxy.ts`) and the layout
 * guard (`src/lib/api/guard.ts`). No imports beyond the `Role` type, so this
 * stays safe to pull into the middleware bundle.
 *
 * The role model: everyone self-registers as a `student`. A student who has
 * verified their email is **teacher-capable** — they can open the teacher
 * workspace and switch back to the student one at will. Only `role: "teacher"`
 * accounts (legacy / seeded) skip the email check.
 */
export interface Capability {
  role: Role;
  emailVerified: boolean;
}

/** The three workspace URL trees. A `canTeach` student moves freely between `student` and `teacher`. */
export type WorkspaceMode = Role;

export function canTeach(c: Capability): boolean {
  return c.role === "teacher" || (c.role === "student" && c.emailVerified);
}

/** May this user enter the given workspace's URL tree? */
export function canAccessWorkspace(c: Capability, mode: WorkspaceMode): boolean {
  if (mode === "admin") return c.role === "admin";
  if (mode === "teacher") return canTeach(c);
  // Student workspace: everyone but an admin (a teacher can review the learner-side screens too).
  return c.role !== "admin";
}

/** Where to send a user who has no explicit destination — their "home" workspace. */
export function homeWorkspace(c: Capability): WorkspaceMode {
  if (c.role === "admin") return "admin";
  if (c.role === "teacher") return "teacher";
  return "student";
}
