import { getCurrentUser } from "@/lib/api/session";
import { redirect } from "@/i18n/navigation";
import type { ApiUser, Role } from "@/lib/types";

/**
 * Guard for a role-scoped layout. Returns the authenticated user or redirects:
 * no session → `/login`; wrong role → that role's own dashboard.
 */
export async function requireRole(role: Role, locale: string): Promise<ApiUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect({ href: "/login", locale });
    throw new Error("unreachable");
  }
  if (user.role !== role) {
    redirect({ href: `/${user.role}/dashboard`, locale });
    throw new Error("unreachable");
  }
  return user;
}
