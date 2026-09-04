import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { ACCESS_COOKIE, API_URL, REFRESH_COOKIE } from "@/lib/api/envelope";

/**
 * Proxy định tuyến ngôn ngữ (Next.js 16 đổi tên `middleware` -> `proxy`) +
 * làm mới phiên đăng nhập.
 *
 * - next-intl: phát hiện ngôn ngữ từ URL / cookie / Accept-Language rồi chuyển
 *   hướng về `/vi` hoặc `/en`.
 * - Auth: nếu `topti_at` (access JWT) hết hạn mà còn `topti_rt` (refresh), gọi
 *   `/auth/refresh` ở tầng proxy (nơi DUY NHẤT ghi cookie được trước khi render)
 *   và gắn cặp token mới vào cả request hiện tại lẫn response.
 */
const intlMiddleware = createMiddleware(routing);

const isProd = process.env.NODE_ENV === "production";
const cookieOpts = { httpOnly: true, sameSite: "lax" as const, secure: isProd, path: "/" };

function decodeJwt(token: string | undefined): { exp?: number; role?: string } | null {
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    return JSON.parse(Buffer.from(payload, "base64").toString("utf8")) as { exp?: number; role?: string };
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

export default async function proxy(request: NextRequest) {
  const access = request.cookies.get(ACCESS_COOKIE)?.value;
  const refresh = request.cookies.get(REFRESH_COOKIE)?.value;

  let refreshed: { at: string; rt: string } | null = null;
  let sessionDead = false;

  if (refresh && accessTokenExpired(access)) {
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
          // Make this same render see the fresh access token.
          request.cookies.set(ACCESS_COOKIE, at);
          request.cookies.set(REFRESH_COOKIE, refreshed.rt);
        }
      } else if (res.status === 401) {
        sessionDead = true;
      }
    } catch {
      /* backend unreachable — leave the session as-is, pages will handle the failure */
    }
  }

  // Gate the dashboard areas before any render: no usable session -> /login;
  // wrong role -> that role's own dashboard.
  const wantRole = protectedRoleFromPath(request.nextUrl.pathname);
  if (wantRole) {
    const locale = request.nextUrl.pathname.split("/").filter(Boolean)[0] || routing.defaultLocale;
    const effectiveAccess = refreshed?.at ?? request.cookies.get(ACCESS_COOKIE)?.value;
    const claims = decodeJwt(effectiveAccess);
    const hasSession = Boolean(claims) && (!refreshed ? !accessTokenExpired(effectiveAccess) : true);

    if (!hasSession && !refreshed) {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/login`;
      const res = NextResponse.redirect(url);
      if (sessionDead) {
        res.cookies.delete(ACCESS_COOKIE);
        res.cookies.delete(REFRESH_COOKIE);
      }
      return res;
    }
    if (claims?.role && claims.role !== wantRole) {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/${claims.role}/dashboard`;
      return NextResponse.redirect(url);
    }
  }

  const response = intlMiddleware(request);

  if (refreshed) {
    response.cookies.set(ACCESS_COOKIE, refreshed.at, { ...cookieOpts, maxAge: 60 * 20 });
    response.cookies.set(REFRESH_COOKIE, refreshed.rt, { ...cookieOpts, maxAge: 60 * 60 * 24 * 7 });
  } else if (sessionDead) {
    response.cookies.delete(ACCESS_COOKIE);
    response.cookies.delete(REFRESH_COOKIE);
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
