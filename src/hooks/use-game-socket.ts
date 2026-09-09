"use client";

import { useCallback, useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";

/** `NEXT_PUBLIC_API_URL` is `.../api/v1` (the REST base); the Socket.IO gateways live on the bare backend origin — same helper `use-notifications.ts` has, duplicated rather than shared across two small hooks. */
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

export type GameAck<T> = { ok: true; data: T } | { ok: false; error: string };

/**
 * Connects to the backend's `game` namespace (the live minigame — see `BE/CLAUDE.md`). Returns
 * the raw `Socket` (as reactive state, not a ref, so a page's own `useEffect(() => {...}, [socket])`
 * can subscribe to broadcast events once it exists) plus an ack-callback `emit` helper matching
 * `GameGateway`'s `{ok:true,data} | {ok:false,error}` response shape for every action.
 */
export function useGameSocket() {
  // Created lazily during render (not in an effect) so `socket` is available on the very first
  // render — `autoConnect: false` means constructing it doesn't itself open a connection, so this
  // stays pure enough for render. `react-hooks/set-state-in-effect` (see `BE`/`FE` CLAUDE.md) is
  // an error here, which is exactly what calling `setSocket(...)` from inside the effect below
  // would trip — the actual connect + event wiring still happens in the effect, just not the
  // state-holding-the-instance part.
  const [socket] = useState<Socket>(() =>
    io(`${backendOrigin()}/game`, {
      transports: ["websocket"],
      autoConnect: false,
      // Re-fetched on every (re)connection attempt — a token that expires mid-session still
      // gets a fresh one on the socket's automatic reconnect, same as `use-notifications.ts`.
      auth: (callback: (data: { token: string | null }) => void) => {
        void fetchSocketToken().then((token) => callback({ token }));
      },
    }),
  );
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.connect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.disconnect();
    };
  }, [socket]);

  const emit = useCallback(
    <T,>(event: string, payload: unknown): Promise<GameAck<T>> =>
      new Promise((resolve) => {
        if (!socket) {
          resolve({ ok: false, error: "Chưa kết nối tới máy chủ." });
          return;
        }
        socket.emit(event, payload, (ack: GameAck<T>) => resolve(ack));
      }),
    [socket],
  );

  return { socket, connected, emit };
}
