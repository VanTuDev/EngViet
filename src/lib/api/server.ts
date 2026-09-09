import { API_URL, ApiError, parseResponse } from "@/lib/api/envelope";
import {
  extractRefreshToken,
  getSessionTokens,
  writeSession,
  type SessionTokens,
} from "@/lib/api/session";

type Json = Record<string, unknown> | unknown[] | null;

interface Options {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: Json;
  /** Bust the default no-store for reads that can tolerate a short cache. */
  revalidate?: number;
}

function buildInit(method: string, token: string | undefined, body: Json | undefined, revalidate?: number): RequestInit {
  const init: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  };
  init.cache = revalidate ? undefined : "no-store";
  if (revalidate) init.next = { revalidate };
  return init;
}

/** Server→server call to the backend's `/auth/refresh` using our stored refresh token. Returns the rotated pair or null. */
async function refresh(tokens: SessionTokens): Promise<SessionTokens | null> {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { Cookie: `refreshToken=${tokens.refreshToken}` },
      redirect: "manual",
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await parseResponse<{ accessToken: string }>(res);
    if (!data?.accessToken) return null;
    return { accessToken: data.accessToken, refreshToken: extractRefreshToken(res, tokens.refreshToken) };
  } catch {
    return null;
  }
}

/**
 * Authenticated call to the backend from a Server Component / Server Action.
 * Attaches `Authorization: Bearer`, and on a 401 refreshes once (persisting the
 * rotated pair when the context allows — a no-op during render, where the proxy
 * already refreshed) and retries. A dead session throws `ApiError(401)`;
 * `getCurrentUser()` catches that and the protected layout redirects to `/login`.
 *
 * It deliberately does **not** clear the session cookies on a failed refresh — a
 * transient failure (a rotation race, a brief backend blip) must not destroy a
 * still-valid session. A genuinely dead session ends at the `/login` redirect,
 * where re-authenticating overwrites the cookies anyway.
 */
export async function apiServer<T>(path: string, opts: Options = {}): Promise<T> {
  const tokens = await getSessionTokens();
  if (!tokens) throw new ApiError(401, "Chưa đăng nhập.");

  const method = opts.method ?? "GET";
  let res = await fetch(`${API_URL}${path}`, buildInit(method, tokens.accessToken, opts.body, opts.revalidate));

  if (res.status === 401) {
    const rotated = await refresh(tokens);
    if (!rotated) {
      throw new ApiError(401, "Phiên đăng nhập đã hết hạn.");
    }
    await writeSession(rotated);
    res = await fetch(`${API_URL}${path}`, buildInit(method, rotated.accessToken, opts.body, opts.revalidate));
  }

  return parseResponse<T>(res);
}

/** Unauthenticated call for the handful of `@Public()` endpoints (pricing plans, class-by-code preview). */
export async function apiPublic<T>(path: string, opts: Options = {}): Promise<T> {
  const res = await fetch(
    `${API_URL}${path}`,
    buildInit(opts.method ?? "GET", undefined, opts.body, opts.revalidate),
  );
  return parseResponse<T>(res);
}

export { refresh as refreshTokens };
