import { ImageResponse } from "next/og";

// Apple touch icon — iOS bo góc sẵn nên để nền đặc, không bo.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
          fontSize: 110,
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
