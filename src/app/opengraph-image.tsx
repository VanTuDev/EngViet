import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#f8f9ff",
          backgroundImage: "linear-gradient(135deg, #f8f9ff 0%, #dbe1ff 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 84,
              height: 84,
              borderRadius: 20,
              backgroundColor: "#004ac6",
              color: "#ffffff",
              fontSize: 48,
              fontWeight: 700,
            }}
          >
            T
          </div>
          <div style={{ fontSize: 56, fontWeight: 700, color: "#004ac6" }}>{siteConfig.name}</div>
        </div>
        <div style={{ marginTop: 40, fontSize: 40, fontWeight: 600, color: "#0b1c30", maxWidth: 900, lineHeight: 1.3, display: "flex" }}>
          {siteConfig.tagline}
        </div>
      </div>
    ),
    { ...size },
  );
}
