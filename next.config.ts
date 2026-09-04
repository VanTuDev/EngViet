import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    optimizePackageImports: ["@ant-design/icons", "antd"],
    // Các khu vực dashboard là `force-dynamic` nên mặc định KHÔNG được cache ở
    // client — mỗi lần quay lại một tab đã xem là một vòng gọi server. Giữ RSC
    // payload 30s để đổi qua lại giữa các tab gần như tức thì. Sau khi ghi dữ
    // liệu (tạo lớp…) nơi gọi đã `router.refresh()` nên không lo dữ liệu cũ.
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
};

/**
 * Bọc cấu hình Next bằng plugin next-intl.
 * Tham số trỏ tới file cấu hình request (`src/i18n/request.ts`) — nơi nạp
 * từ điển dịch cho mỗi request.
 */
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
