"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

interface UseCountdownOptions {
  onExpire?: () => void;
  autoStart?: boolean;
}

/** Second-resolution countdown driven by `Date.now()` deltas so it stays accurate even if the tab is backgrounded/throttled. */
export function useCountdown(initialSeconds: number, { onExpire, autoStart = true }: UseCountdownOptions = {}) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [running, setRunning] = useState(autoStart);
  // Real deadline is (re)computed inside the effect below before it's ever
  // read, so the ref only needs a pure placeholder here.
  const deadlineRef = useRef(0);
  const onExpireRef = useRef(onExpire);

  // Refs must not be written during render — keep the "latest callback" ref
  // in sync via a layout effect instead of mutating it inline.
  useLayoutEffect(() => {
    onExpireRef.current = onExpire;
  });

  useEffect(() => {
    if (!running) return;
    deadlineRef.current = Date.now() + secondsLeft * 1000;

    const tick = () => {
      const remainingMs = deadlineRef.current - Date.now();
      const remaining = Math.max(0, Math.ceil(remainingMs / 1000));
      setSecondsLeft(remaining);
      if (remaining <= 0) {
        setRunning(false);
        onExpireRef.current?.();
      }
    };

    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally excludes secondsLeft to avoid resetting the deadline every tick
  }, [running]);

  return {
    secondsLeft,
    isRunning: running,
    isExpired: secondsLeft <= 0,
    pause: () => setRunning(false),
    resume: () => setRunning(true),
    reset: (nextSeconds = initialSeconds) => {
      setSecondsLeft(nextSeconds);
      deadlineRef.current = Date.now() + nextSeconds * 1000;
    },
  };
}
