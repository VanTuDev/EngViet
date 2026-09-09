import { getCurrentUser } from "@/lib/api/session";
import { redirect } from "@/i18n/navigation";
import { canAccessWorkspace, homeWorkspace, type WorkspaceMode } from "@/lib/workspace";
import type { ApiUser } from "@/lib/types";

/**
 * Guard for a workspace-scoped layout. Returns the authenticated user or redirects:
 * no session → `/login`; not allowed in this workspace → the user's home workspace.
 *
 * "Workspace" (not "role"): a student who has verified their email may enter the
 * `teacher` tree, and a teacher may look at the `student` tree — see
 * `lib/workspace.ts`. Only `admin` is strictly role-locked.
 */
export async function requireRole(mode: WorkspaceMode, locale: string): Promise<ApiUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect({ href: "/login", locale });
    throw new Error("unreachable");
  }
  if (!canAccessWorkspace(user, mode)) {
    redirect({ href: `/${homeWorkspace(user)}/dashboard`, locale });
    throw new Error("unreachable");
  }
  return user;
}
