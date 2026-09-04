"use server";

import { API_URL, ApiError, parseResponse } from "@/lib/api/envelope";
import { clearSession, extractRefreshToken, getSessionTokens, writeSession } from "@/lib/api/session";
import type { ApiUser } from "@/lib/types";

interface AuthResult {
  ok: boolean;
  role?: ApiUser["role"];
  /** Backend error message (already Vietnamese), for the form to show. */
  error?: string;
}

/** POSTs to a backend auth endpoint server-side, captures the token pair, persists our session cookies. */
async function establish(path: string, body: Record<string, unknown>): Promise<AuthResult> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      redirect: "manual",
      cache: "no-store",
    });
  } catch {
    return { ok: false, error: "Không kết nối được máy chủ. Vui lòng thử lại." };
  }

  let data: { accessToken: string; user: ApiUser };
  try {
    data = await parseResponse<{ accessToken: string; user: ApiUser }>(res);
  } catch (err) {
    return { ok: false, error: err instanceof ApiError ? err.message : "Đăng nhập thất bại." };
  }

  await writeSession({ accessToken: data.accessToken, refreshToken: extractRefreshToken(res, "") });
  return { ok: true, role: data.user.role };
}

/** Trade the one-time code from the Google redirect for a session. */
export async function establishSessionFromCode(code: string): Promise<AuthResult> {
  if (!code) return { ok: false, error: "Thiếu mã đăng nhập." };
  return establish("/auth/exchange", { code });
}

export async function loginWithPassword(email: string, password: string): Promise<AuthResult> {
  return establish("/auth/login", { email, password });
}

export async function registerAccount(input: {
  email: string;
  password: string;
  fullName: string;
  role: "teacher" | "student";
}): Promise<AuthResult> {
  return establish("/auth/register", input);
}

export async function logoutAction(): Promise<void> {
  const tokens = await getSessionTokens();
  if (tokens?.refreshToken) {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: { Cookie: `refreshToken=${tokens.refreshToken}` },
        redirect: "manual",
        cache: "no-store",
      });
    } catch {
      /* revoke best-effort — clear our side regardless */
    }
  }
  await clearSession();
}
