/**
 * Shared bits for talking to the NestJS backend (Backend-EngViet).
 *
 * The backend wraps every success response through its
 * `TransformResponseInterceptor` as `{ success, statusCode, path, timestamp, data }`;
 * errors are `{ success: false, statusCode, message }`. `unwrap()` pulls `data`
 * out so callers get the bare payload.
 */

export const API_URL =
  process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

/** Base URL usable from the browser (Google sign-in is a full-page navigation, not a fetch). */
export const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

/** URL that kicks off Google OAuth for a given role. */
export function googleLoginUrl(role: "teacher" | "student"): string {
  return `${PUBLIC_API_URL}/auth/google?role=${role}`;
}

/** httpOnly cookies this app sets for its own BFF session (see `lib/api/session.ts`). */
export const ACCESS_COOKIE = "topti_at";
export const REFRESH_COOKIE = "topti_rt";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface Envelope<T> {
  success: boolean;
  statusCode: number;
  message?: string | string[];
  data?: T;
}

function isEnvelope(v: unknown): v is Envelope<unknown> {
  return typeof v === "object" && v !== null && "success" in v && "statusCode" in v;
}

export function errorMessage(body: unknown, fallback: string): string {
  if (isEnvelope(body) && body.message) {
    return Array.isArray(body.message) ? body.message.join(", ") : body.message;
  }
  return fallback;
}

/** Parse a fetch Response, throwing `ApiError` on !ok and returning the unwrapped `data`. */
export async function parseResponse<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T;

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    body = undefined;
  }

  if (!res.ok) {
    throw new ApiError(res.status, errorMessage(body, res.statusText));
  }

  return (isEnvelope(body) ? (body.data as T) : (body as T)) ?? (undefined as T);
}

/** Pagination envelope the backend's `PaginatedResultDto` produces. */
export interface Paginated<T> {
  data: T[];
  meta: { page: number; limit: number; totalItems: number; totalPages: number };
}
