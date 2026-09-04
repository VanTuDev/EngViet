import { ImageResponse } from "next/og";

// Icon PWA/favicon sinh động (không cần file PNG thủ công). Nền đặc kín khung để
// dùng được cả dạng "maskable" — chữ T nằm trong vùng an toàn giữa.
export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #004ac6 0%, #2563eb 100%)",
          color: "#ffffff",
          fontSize: 300,
          fontWeight: 700,
          fontFamily: "sans-serif",
        }}
      >
        T
      </div>
    ),
    { ...size },
  );
}
