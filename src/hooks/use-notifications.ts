"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { markAllNotificationsRead, markNotificationRead } from "@/lib/actions";
import type { AppNotification } from "@/lib/types";

/** `NEXT_PUBLIC_API_URL` is `.../api/v1` (the REST base); the Socket.IO gateway lives on the bare backend origin. */
function backendOrigin(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";
  return apiUrl.replace(/\/api\/v\d+\/?$/, "");
}

async function fetchSocketToken(): Promise<string | null> {
  try {
    const res = await fetch("/api/socket-token", { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as { accessToken: string | null };
    return data.accessToken;
  } catch {
    return null;
  }
}

const MAX_KEPT = 50;

/**
 * Realtime notification feed for the exam-schedule feature: seeds from the server-rendered
 * `initial` list (so the bell isn't empty on first paint), then keeps it live via a WebSocket
 * connection to the backend's `notifications` gateway — a new assignment or deadline reminder
 * appears the instant the backend pushes it, no polling.
 */
export function useNotifications(initial: AppNotification[]) {
  const [items, setItems] = useState<AppNotification[]>(initial);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(`${backendOrigin()}/notifications`, {
      transports: ["websocket"],
      autoConnect: false,
      // Re-fetched on every (re)connection attempt, not captured once — a token that expires
      // while the tab is open still gets a fresh one on the socket's automatic reconnect.
      auth: (callback: (data: { token: string | null }) => void) => {
        void fetchSocketToken().then((token) => callback({ token }));
      },
    });
    socketRef.current = socket;

    socket.on("notification:new", (notification: AppNotification) => {
      setItems((prev) => [notification, ...prev.filter((n) => n.id !== notification.id)].slice(0, MAX_KEPT));
    });

    socket.connect();
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const unreadCount = items.reduce((count, n) => (n.read ? count : count + 1), 0);

  const markRead = useCallback((id: string) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    void markNotificationRead(id);
  }, []);

  const markAllRead = useCallback(() => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    void markAllNotificationsRead();
  }, []);

  return { items, unreadCount, markRead, markAllRead };
}
