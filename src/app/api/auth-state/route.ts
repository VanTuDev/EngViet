import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { REFRESH_COOKIE } from "@/lib/api/envelope";

type Role = "admin" | "teacher" | "student";
const ROLES: Role[] = ["admin", "teacher", "student"];

/**
 * A lightweight, unauthenticated **UI hint** for the marketing header: is someone signed in, and
 * as what role? It decodes (does NOT verify) the `topti_rt` cookie's `role` claim — enough to swap
 * the "Đăng nhập / Đăng ký" buttons for a "Vào bảng điều khiển" link so a logged-in user who lands
 * on a public page (e.g. Trung tâm trợ giúp) doesn't think they've been logged out. The real
 * session gate is still `src/proxy.ts` + the role layouts; nothing here grants access.
 */
export async function GET(): Promise<NextResponse> {
  const jar = await cookies();
  const token = jar.get(REFRESH_COOKIE)?.value;
  const role = decodeRole(token);
  return NextResponse.json(
    role ? { loggedIn: true, role } : { loggedIn: false },
    { headers: { "Cache-Control": "no-store" } },
  );
}

function decodeRole(token: string | undefined): Role | null {
  if (!token) return null;
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const claims = JSON.parse(Buffer.from(part, "base64").toString("utf8")) as { role?: string; exp?: number };
    if (typeof claims.exp === "number" && Date.now() / 1000 > claims.exp) return null;
    return ROLES.find((r) => r === claims.role) ?? null;
  } catch {
    return null;
  }
}
