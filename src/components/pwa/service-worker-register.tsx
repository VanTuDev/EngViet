"use client";

import { useEffect } from "react";

/**
 * Đăng ký service worker (`/sw.js`) sau khi trang tải xong, chỉ ở production.
 * Không render gì. SW lo cache app-shell + fallback trang offline.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.warn("Đăng ký service worker thất bại:", err);
      });
    };

    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });

    return () => window.removeEventListener("load", onLoad);
  }, []);

  return null;
}
