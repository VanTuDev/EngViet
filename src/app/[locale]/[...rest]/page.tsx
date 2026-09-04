import { notFound } from "next/navigation";

/**
 * Bắt mọi đường dẫn lạ nằm trong segment ngôn ngữ (`/vi/khong-ton-tai`) và
 * trả về trang 404 địa phương hóa (`[locale]/not-found.tsx`).
 */
export default function CatchAllPage() {
  notFound();
}
