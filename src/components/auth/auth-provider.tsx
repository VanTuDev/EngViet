"use client";

import { createContext, useCallback, useContext } from "react";
import type { ReactNode } from "react";
import { logoutAction } from "@/lib/api/auth-actions";
import { useRouter } from "@/i18n/navigation";
import type { ApiUser } from "@/lib/types";

type AuthStatus = "authenticated" | "anonymous";

interface AuthContextValue {
  status: AuthStatus;
  user: ApiUser | null;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Display-only auth context. The real session lives in httpOnly cookies the
 * middleware keeps fresh (`src/proxy.ts` + `lib/api/session.ts`); `initialUser`
 * is resolved server-side in `[locale]/layout.tsx` via `getCurrentUser()` and
 * flows down here, so it re-syncs on every navigation without any client fetch.
 */
export function AuthProvider({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser: ApiUser | null;
}) {
  const router = useRouter();

  const logout = useCallback(async () => {
    await logoutAction();
    router.replace("/login");
    router.refresh();
  }, [router]);

  return (
    <AuthContext.Provider
      value={{ status: initialUser ? "authenticated" : "anonymous", user: initialUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth phải nằm trong <AuthProvider>");
  return ctx;
}
