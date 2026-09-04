"use client";

import { useEffect } from "react";

/**
 * Ranh giới lỗi cấp cao nhất — chỉ bung ra khi CHÍNH root layout ném lỗi. Nó
 * thay cả `<html>`/`<body>` nên phải tự khai báo, và không dùng được i18n
 * (nằm ngoài mọi provider) → để song ngữ tối giản.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="vi">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          fontFamily: "system-ui, sans-serif",
          background: "#f8f9ff",
          color: "#0b1c30",
          padding: 24,
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: 24, margin: 0 }}>Đã có lỗi xảy ra · Something went wrong</h1>
        <p style={{ maxWidth: 420, color: "#434655" }}>
          Xin lỗi, có sự cố khi tải trang. · Sorry, there was a problem loading the page.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: 8,
            height: 44,
            padding: "0 24px",
            borderRadius: 8,
            border: "none",
            background: "#004ac6",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Thử lại · Try again
        </button>
      </body>
    </html>
  );
}
