import { siteConfig } from "@/lib/site";

// The llms.txt convention: a plain-text, unambiguous summary that generative
// answer engines can ingest directly instead of scraping and guessing at
// rendered HTML. This is the GEO counterpart to robots.txt/sitemap.xml.
export async function GET() {
  const body = `# ${siteConfig.fullName}

> ${siteConfig.description}

## Sản phẩm
TOPTI là nền tảng SaaS dành cho giáo viên tiếng Anh tự do (đặc biệt là luyện thi IELTS
và giao tiếp) để giao tài liệu, tổ chức thi trắc nghiệm ABCD và minigame ghép từ vựng
có bấm giờ cho học sinh, thay thế việc gửi bài qua nhóm chat và chấm điểm thủ công.

## Đối tượng người dùng
- Giáo viên tiếng Anh tự do quản lý nhiều lớp luyện thi (IELTS, TOEIC, giao tiếp).
- Học sinh luyện thi tham gia lớp bằng mã lớp 6 ký tự và làm bài tập có giới hạn thời gian.
- Quản trị viên nền tảng giám sát doanh thu, gói cước và tài khoản giáo viên.

## Tính năng chính
- Mua và gia hạn gói cước theo số lượng học sinh (slot), thanh toán qua VietQR.
- Tạo lớp học và cấp mã lớp (class code) để học sinh tự tham gia.
- Nhập danh sách từ vựng qua Excel, hệ thống tự sinh bài trắc nghiệm ABCD và minigame
  ghép từ vựng Anh - Việt có đồng hồ đếm ngược.
- Chấm điểm tự động ngay khi nộp bài, hiển thị bảng xếp hạng theo lớp.
- Thống kê điểm số, tỉ lệ hoàn thành và xuất báo cáo cho giáo viên.

## Liên hệ
- Trang chủ: ${siteConfig.url}
- Bảng giá: ${siteConfig.url}/pricing
- Hỗ trợ: ${siteConfig.supportEmail}
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
