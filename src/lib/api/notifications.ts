import { apiServer } from "@/lib/api/server";
import type { Paginated } from "@/lib/api/envelope";
import type { AppNotification } from "@/lib/types";

/** Newest first — the initial page rendered server-side before the client hook takes over via WebSocket. */
export async function getMyNotifications(limit = 20): Promise<AppNotification[]> {
  const res = await apiServer<Paginated<AppNotification>>(`/notifications/mine?limit=${limit}`);
  return res.data;
}

export async function getUnreadNotificationCount(): Promise<number> {
  const res = await apiServer<{ count: number }>("/notifications/unread-count");
  return res.count;
}
