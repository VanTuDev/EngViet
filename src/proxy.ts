import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { ACCESS_COOKIE, API_URL, REFRESH_COOKIE } from "@/lib/api/envelope";
import { canAccessWorkspace, homeWorkspace } from "@/lib/workspace";
import type { Role } from "@/lib/types";

/**
 * Proxy định tuyến ngôn ngữ (Next.js 16 đổi tên `middleware` -> `proxy`) +
 * làm mới phiên đăng nhập.
 *
 * - next-intl: phát hiện ngôn ngữ từ URL / cookie / Accept-Language rồi chuyển
 *   hướng về `/vi` hoặc `/en`.
 * - Auth: **chỉ** cho khu vực dashboard (`/{locale}/(teacher|student|admin)/*`).
 *   Nếu `topti_at` (access JWT) hết hạn mà còn `topti_rt` (refresh), gọi
 *   `/auth/refresh` ở tầng proxy (nơi DUY NHẤT ghi cookie được trước khi render)
 *   và gắn cặp token mới vào cả request hiện tại lẫn response.
 *
 * Hai điều KHÔNG được làm, vì chúng từng khiến người dùng bị đăng xuất khi bấm
 * sang trang công khai (vd "Trung tâm trợ giúp"):
 *   1. Không refresh trên route công khai. Trang marketing/`/login`/... không đọc
 *      phiên; refresh ở đó (vd khi Next **prefetch** `/help`) xoay refresh token
 *      ngay dưới chân lần điều hướng thật -> lần thật nhận token đã bị thu hồi -> logout.
 *   2. Không refresh cho request **prefetch** (kể cả route được bảo vệ). Prefetch
 *      không được phép thay đổi trạng thái server; để lần điều hướng thật lo việc đó.
 * Backend còn có "cửa sổ ân hạn" 20s cho refresh-token vừa xoay (xem BE auth) —
 * lớp phòng thủ thứ hai cho các tình huống hai tab / double-click.
 */
const intlMiddleware = createMiddleware(routing);

const isProd = process.env.NODE_ENV === "production";
const cookieOpts = { httpOnly: true, sameSite: "lax" as const, secure: isProd, path: "/" };
const ACCESS_MAX_AGE = 60 * 20;
const REFRESH_MAX_AGE = 60 * 60 * 24 * 7;

function decodeJwt(token: string | undefined): { exp?: number; role?: string; emailVerified?: boolean } | null {
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    return JSON.parse(Buffer.from(payload, "base64").toString("utf8")) as {
      exp?: number;
      role?: string;
      emailVerified?: boolean;
    };
  } catch {
    return null;
  }
}

function accessTokenExpired(token: string | undefined): boolean {
  const j = decodeJwt(token);
  return !j || typeof j.exp !== "number" || Date.now() / 1000 > j.exp - 30;
}

/** `/vi/teacher/...` -> `teacher`. */
const PROTECTED_PREFIXES = ["teacher", "student", "admin"] as const;
function protectedRoleFromPath(pathname: string): (typeof PROTECTED_PREFIXES)[number] | null {
  const seg = pathname.split("/").filter(Boolean); // ["vi","teacher",...]
  const role = seg[1];
  return PROTECTED_PREFIXES.find((p) => p === role) ?? null;
}

/** A route prefetch (hover, viewport) — must be a pure read, never mutate the session. */
function isPrefetch(request: NextRequest): boolean {
  const h = request.headers;
  return (
    h.get("next-router-prefetch") === "1" ||
    h.get("x-middleware-prefetch") === "1" ||
    (h.get("purpose") ?? h.get("x-purpose") ?? h.get("sec-purpose") ?? "").includes("prefetch")
  );
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const wantRole = protectedRoleFromPath(pathname);

  // Public routes (marketing, /login, /register, /join, ...) never read the session server-side —
  // and must never have it touched here. Just do locale routing and pass the cookies through
  // untouched.
  if (!wantRole) {
    return intlMiddleware(request);
  }

  const locale = pathname.split("/").filter(Boolean)[0] || routing.defaultLocale;
  const prefetch = isPrefetch(request);
  const access = request.cookies.get(ACCESS_COOKIE)?.value;
  const refresh = request.cookies.get(REFRESH_COOKIE)?.value;

  let refreshed: { at: string; rt: string } | null = null;
  let sessionDead = false;

  if (refresh && accessTokenExpired(access) && !prefetch) {
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { Cookie: `refreshToken=${refresh}` },
        redirect: "manual",
        cache: "no-store",
      });
      if (res.ok) {
        const body = (await res.json()) as { data?: { accessToken?: string } };
        const at = body.data?.accessToken;
        const setCookie = (res.headers.getSetCookie?.() ?? []).find((c) => c.startsWith("refreshToken="));
        const rt = setCookie
          ? decodeURIComponent(setCookie.slice("refreshToken=".length).split(";")[0] ?? "")
          : refresh;
        if (at) {
          refreshed = { at, rt: rt || refresh };
          request.cookies.set(ACCESS_COOKIE, at);
          request.cookies.set(REFRESH_COOKIE, refreshed.rt);
        }
      } else if (res.status === 401) {
        sessionDead = true;
      }
    } catch {
      /* backend unreachable — leave the session as-is; the page render will surface the failure */
    }
  }

  const effectiveAccess = refreshed?.at ?? request.cookies.get(ACCESS_COOKIE)?.value;
  const claims = decodeJwt(effectiveAccess);
  const hasSession = Boolean(refreshed) || (Boolean(claims) && !accessTokenExpired(effectiveAccess));

  if (!hasSession) {
    // A prefetch with a stale token: don't redirect (the client never follows it) and don't
    // clear cookies — the real navigation that follows does the refresh-or-redirect.
    if (prefetch) return intlMiddleware(request);

    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    const res = NextResponse.redirect(url);
    // Only wipe cookies when the backend actually rejected the refresh token (truly dead session),
    // never on a network blip or a race.
    if (sessionDead) {
      res.cookies.delete(ACCESS_COOKIE);
      res.cookies.delete(REFRESH_COOKIE);
    }
    return res;
  }

  // Workspace access is capability-based, not a strict role match: a student who verified their
  // email may enter `/teacher/*`, a teacher may look at `/student/*` — only `/admin/*` is role-locked.
  // See `lib/workspace.ts`.
  if (claims?.role) {
    const cap = { role: claims.role as Role, emailVerified: claims.emailVerified === true };
    if (!canAccessWorkspace(cap, wantRole)) {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/${homeWorkspace(cap)}/dashboard`;
      return NextResponse.redirect(url);
    }
  }

  const response = intlMiddleware(request);
  if (refreshed) {
    response.cookies.set(ACCESS_COOKIE, refreshed.at, { ...cookieOpts, maxAge: ACCESS_MAX_AGE });
    response.cookies.set(REFRESH_COOKIE, refreshed.rt, { ...cookieOpts, maxAge: REFRESH_MAX_AGE });
  }
  return response;
}

export const config = {
  /**
   * Chỉ chạy trên các route "trang".
   * Bỏ qua: API, file nội bộ Next, và các file metadata KHÔNG địa phương hóa
   * (sitemap, robots, manifest, llms.txt, opengraph-image, favicon...).
   */
  matcher: [
    "/((?!api|_next|_vercel|sitemap.xml|robots.txt|manifest.webmanifest|llms.txt|opengraph-image|icon|apple-icon|sw.js|offline.html|favicon.svg|.*\\..*).*)",
  ],
};
