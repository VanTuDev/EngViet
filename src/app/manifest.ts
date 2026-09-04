import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

/**
 * Web App Manifest — cho phép cài TOPTI như app trên điện thoại (học sinh dùng
 * chủ yếu trên mobile). Icon dùng SVG full-bleed (Android Chrome hỗ trợ, kể cả
 * maskable); iOS lấy `apple-icon` qua thẻ link tự sinh.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: siteConfig.fullName,
    short_name: siteConfig.name,
    description: siteConfig.description,
    // start_url không đi qua redirect (`/` -> `/vi`) để khi mở app không thấy
    // thanh địa chỉ chớp lên. Thị trường mặc định là tiếng Việt.
    start_url: "/vi",
    scope: "/",
    // `standalone` = KHÔNG có thanh URL khi cài về máy; `minimal-ui` là phương án
    // lùi cho trình duyệt không hỗ trợ standalone.
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    orientation: "portrait",
    background_color: "#f8f9ff",
    theme_color: "#004ac6",
    lang: "vi",
    dir: "ltr",
    categories: ["education", "productivity"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
    shortcuts: [
      { name: "Vào lớp học", short_name: "Vào lớp", url: "/vi/join" },
      { name: "Bài tập của tôi", short_name: "Bài tập", url: "/vi/student/assignments" },
      { name: "Bảng xếp hạng", short_name: "Xếp hạng", url: "/vi/student/leaderboard" },
    ],
  };
}
