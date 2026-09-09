import { NextResponse } from "next/server";
import { getSessionTokens } from "@/lib/api/session";

/**
 * Hands the browser its own short-lived access token so it can authenticate a direct
 * WebSocket connection to the backend's `notifications` gateway (realtime exam-schedule
 * pushes). This is the one deliberate exception to "the access token never reaches client
 * JS" — it normally lives only in the `topti_at` httpOnly cookie, read server-side by
 * `apiServer`. A browser-to-backend Socket.IO connection has no server hop to attach a
 * `Bearer` header for it, so the client needs the raw token for the handshake.
 *
 * Kept as low-risk as that trade-off allows: the token is already scoped to exactly what
 * this account can already do via the REST API, expires in ~15 minutes, and this route only
 * ever returns *the caller's own* current token — it never accepts one. Fetched into memory
 * client-side (see `src/hooks/use-notifications.ts`), never persisted to `localStorage`/a
 * readable cookie.
 */
export async function GET(): Promise<NextResponse> {
  const tokens = await getSessionTokens();
  if (!tokens?.accessToken) {
    return NextResponse.json({ accessToken: null }, { status: 401 });
  }
  return NextResponse.json({ accessToken: tokens.accessToken });
}
