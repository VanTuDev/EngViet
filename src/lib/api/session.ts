import { cookies } from "next/headers";
import { cache } from "react";
import { ACCESS_COOKIE, API_URL, ApiError, parseResponse, REFRESH_COOKIE } from "@/lib/api/envelope";
import type { ApiUser } from "@/lib/types";

/**
 * Frontend BFF session. The browser only ever holds two httpOnly cookies set
 * by *this* app (not the backend): `topti_at` (access JWT, ~15m) and `topti_rt`
 * (refresh token, ~7d). Server Components read them via `apiServer`; the
 * middleware (`src/proxy.ts`) transparently refreshes an expired `topti_at`
 * from `topti_rt` before the render runs, since a Server Component render
 * cannot write cookies.
 */
const isProd = process.env.NODE_ENV === "production";
const ACCESS_MAX_AGE = 60 * 20; // a bit over the backend's 15m, refreshed by the proxy well before this
const REFRESH_MAX_AGE = 60 * 60 * 24 * 7;

export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
}

function cookieOpts(maxAge: number) {
  return { httpOnly: true, sameSite: "lax" as const, secure: isProd, path: "/", maxAge };
}

export async function getSessionTokens(): Promise<SessionTokens | null> {
  const jar = await cookies();
  const accessToken = jar.get(ACCESS_COOKIE)?.value;
  const refreshToken = jar.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) return null;
  return { accessToken: accessToken ?? "", refreshToken };
}

/**
 * Persist a token pair. Works in a Server Action / Route Handler; during a
 * Server Component render `cookies().set` throws — callers there rely on the
 * middleware having already refreshed, so we swallow that.
 */
export async function writeSession(tokens: SessionTokens): Promise<void> {
  try {
    const jar = await cookies();
    jar.set(ACCESS_COOKIE, tokens.accessToken, cookieOpts(ACCESS_MAX_AGE));
    jar.set(REFRESH_COOKIE, tokens.refreshToken, cookieOpts(REFRESH_MAX_AGE));
  } catch {
    /* render context — middleware owns cookie writes there */
  }
}

export async function clearSession(): Promise<void> {
  try {
    const jar = await cookies();
    jar.delete(ACCESS_COOKIE);
    jar.delete(REFRESH_COOKIE);
  } catch {
    /* render context */
  }
}

/**
 * Reads the backend `Set-Cookie: refreshToken=...` off a refresh/login/exchange
 * response so we can re-persist the rotated refresh token under our own name.
 */
export function extractRefreshToken(res: Response, fallback: string): string {
  const setCookies = res.headers.getSetCookie?.() ?? [];
  const match = setCookies.find((c) => c.startsWith("refreshToken="));
  if (!match) return fallback;
  return decodeURIComponent(match.slice("refreshToken=".length).split(";")[0] ?? "") || fallback;
}

/** The currently authenticated user, or null. De-duped per request. Verified by the backend, not decoded locally. */
export const getCurrentUser = cache(async (): Promise<ApiUser | null> => {
  const tokens = await getSessionTokens();
  if (!tokens) return null;
  try {
    const { apiServer } = await import("@/lib/api/server");
    return await apiServer<ApiUser>("/users/me");
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return null;
    return null;
  }
});

export { API_URL, parseResponse };
