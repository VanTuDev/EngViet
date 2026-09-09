"use server";

import { apiServer } from "@/lib/api/server";
import { API_URL, ApiError, parseResponse } from "@/lib/api/envelope";
import { clearSession, extractRefreshToken, getSessionTokens, writeSession } from "@/lib/api/session";
import type { ApiUser } from "@/lib/types";

interface AuthResult {
  ok: boolean;
  role?: ApiUser["role"];
  /** Dev-mode email-verification link (`/verify-email?token=...`) — the backend has no mail provider yet. */
  verifyUrl?: string;
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

  let data: { accessToken: string; user: ApiUser; verifyUrl?: string };
  try {
    data = await parseResponse<{ accessToken: string; user: ApiUser; verifyUrl?: string }>(res);
  } catch (err) {
    return { ok: false, error: err instanceof ApiError ? err.message : "Đăng nhập thất bại." };
  }

  await writeSession({ accessToken: data.accessToken, refreshToken: extractRefreshToken(res, "") });
  return { ok: true, role: data.user.role, verifyUrl: data.verifyUrl };
}

/** Trade the one-time code from the Google redirect for a session. */
export async function establishSessionFromCode(code: string): Promise<AuthResult> {
  if (!code) return { ok: false, error: "Thiếu mã đăng nhập." };
  return establish("/auth/exchange", { code });
}

export async function loginWithPassword(email: string, password: string): Promise<AuthResult> {
  return establish("/auth/login", { email, password });
}

/** Every self-registration is a student. Verifying the email later unlocks the teacher workspace. */
export async function registerAccount(input: {
  email: string;
  password: string;
  fullName: string;
}): Promise<AuthResult> {
  return establish("/auth/register", input);
}

/** Consume a verification token from the emailed link — returns a fresh session for that (now verified) user. */
export async function verifyEmailAction(token: string): Promise<AuthResult> {
  if (!token) return { ok: false, error: "Thiếu mã xác thực." };
  return establish("/auth/verify-email", { token });
}

/** Re-issue the current account's verification link (bearer-authenticated). */
export async function resendVerificationAction(): Promise<{ ok: boolean; verifyUrl?: string; error?: string }> {
  try {
    const data = await apiServer<{ verifyUrl: string }>("/auth/resend-verification", { method: "POST" });
    return { ok: true, verifyUrl: data.verifyUrl };
  } catch (err) {
    return { ok: false, error: err instanceof ApiError ? err.message : "Không gửi được liên kết xác thực." };
  }
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
